from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.serializers import (
    BkashTransactionSerializer,
    PaymentActionResponseSerializer,
    PaymentInitiationSerializer,
    PaymentSerializer,
)
from payments.services import (
    BkashPaymentService,
    PaymentInitiationService,
    StripeWebhookService,
)


class PaymentInitiationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Payments'],
        summary='Initiate payment',
        description='Creates or updates a provider payment session for the authenticated user order using the configured payment strategy.',
        request=PaymentInitiationSerializer,
        responses={201: PaymentActionResponseSerializer},
    )
    def post(self, request):
        serializer = PaymentInitiationSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        payment, result = PaymentInitiationService().initiate_payment(
            order=serializer.context['order'],
            provider=serializer.validated_data['provider'],
            success_url=serializer.validated_data.get('success_url', ''),
            cancel_url=serializer.validated_data.get('cancel_url', ''),
        )

        return Response(
            {
                'payment': PaymentSerializer(payment).data,
                'redirect_url': result.redirect_url,
            },
            status=status.HTTP_201_CREATED,
        )


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Payments'],
        summary='Receive Stripe webhook',
        description='Validates the Stripe signature when configured, updates payment status, and finalizes successful stock reduction transactionally.',
        request=dict,
        responses={
            200: PaymentActionResponseSerializer,
            400: OpenApiResponse(description='Invalid payload, signature, or unknown payment.'),
        },
        examples=[
            OpenApiExample(
                'Stripe checkout session completed',
                value={
                    'id': 'evt_test_123',
                    'type': 'checkout.session.completed',
                    'data': {'object': {'id': 'stripe_test_order_1'}},
                },
                request_only=True,
            ),
        ],
    )
    def post(self, request):
        try:
            payment = StripeWebhookService().handle_event(
                payload=request.body,
                signature=request.headers.get('Stripe-Signature', ''),
            )
        except ValueError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'payment': PaymentSerializer(payment).data,
                'received': True,
            },
            status=status.HTTP_200_OK,
        )


class BkashExecutePaymentView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Payments'],
        summary='Execute bKash payment callback',
        description='Executes a bKash sandbox/provider payment by paymentID and finalizes successful stock reduction transactionally.',
        parameters=[],
        responses={200: PaymentActionResponseSerializer},
    )
    def get(self, request):
        return self._execute(request.query_params)

    @extend_schema(
        tags=['Payments'],
        summary='Execute bKash payment',
        description='Executes a bKash sandbox/provider payment by transaction_id, payment_id, or paymentID.',
        request=BkashTransactionSerializer,
        responses={200: PaymentActionResponseSerializer},
    )
    def post(self, request):
        return self._execute(request.data)

    def _execute(self, data):
        serializer = BkashTransactionSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        try:
            payment = BkashPaymentService().execute_payment(
                serializer.validated_data['transaction_id'],
            )
        except ValueError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'payment': PaymentSerializer(payment).data,
                'executed': True,
            },
            status=status.HTTP_200_OK,
        )


class BkashQueryPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Payments'],
        summary='Query bKash payment callback',
        description='Queries a bKash payment by paymentID. The authenticated user must own the payment, unless staff.',
        parameters=[],
        responses={200: PaymentActionResponseSerializer},
    )
    def get(self, request):
        return self._query(request.query_params, request.user)

    @extend_schema(
        tags=['Payments'],
        summary='Query bKash payment',
        description='Queries a bKash payment by transaction_id, payment_id, or paymentID. The authenticated user must own the payment, unless staff.',
        request=BkashTransactionSerializer,
        responses={200: PaymentActionResponseSerializer},
    )
    def post(self, request):
        return self._query(request.data, request.user)

    def _query(self, data, user):
        serializer = BkashTransactionSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        try:
            payment = BkashPaymentService().query_payment(
                serializer.validated_data['transaction_id'],
            )
        except ValueError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self._can_view_payment(payment, user):
            return Response(
                {'detail': 'You do not have permission to view this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                'payment': PaymentSerializer(payment).data,
                'queried': True,
            },
            status=status.HTTP_200_OK,
        )

    def _can_view_payment(self, payment, user):
        return user.is_staff or payment.order.user_id == user.id
