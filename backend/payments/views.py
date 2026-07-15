from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.serializers import (
    BkashTransactionSerializer,
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

    def get(self, request):
        return self._execute(request.query_params)

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

    def get(self, request):
        return self._query(request.query_params, request.user)

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
