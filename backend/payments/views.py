from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.serializers import PaymentInitiationSerializer, PaymentSerializer
from payments.services import PaymentInitiationService


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
