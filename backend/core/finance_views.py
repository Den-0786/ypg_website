from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Sale, Expense, Contribution
from .serializers import SaleSerializer, ExpenseSerializer, ContributionSerializer
import json

# Sales API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_sales(request):
    """Get all sales"""
    try:
        sales = Sale.objects.all().order_by('-created_at')
        serializer = SaleSerializer(sales, many=True)
        return Response({
            'success': True,
            'sales': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_sale(request):
    """Create a new sale"""
    try:
        data = json.loads(request.body)
        serializer = SaleSerializer(data=data)
        if serializer.is_valid():
            sale = serializer.save()
            return Response({
                'success': True,
                'sale': SaleSerializer(sale).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_sale(request, sale_id):
    """Update a sale"""
    try:
        sale = get_object_or_404(Sale, id=sale_id)
        data = json.loads(request.body)
        serializer = SaleSerializer(sale, data=data, partial=True)
        if serializer.is_valid():
            updated_sale = serializer.save()
            return Response({
                'success': True,
                'sale': SaleSerializer(updated_sale).data
            })
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_sale(request, sale_id):
    """Delete a sale"""
    try:
        sale = get_object_or_404(Sale, id=sale_id)
        sale.delete()
        return Response({
            'success': True,
            'message': 'Sale deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Expenses API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_expenses(request):
    """Get all expenses"""
    try:
        expenses = Expense.objects.all().order_by('-created_at')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response({
            'success': True,
            'expenses': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_expense(request):
    """Create a new expense"""
    try:
        data = json.loads(request.body)
        serializer = ExpenseSerializer(data=data)
        if serializer.is_valid():
            expense = serializer.save()
            return Response({
                'success': True,
                'expense': ExpenseSerializer(expense).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_expense(request, expense_id):
    """Update an expense"""
    try:
        expense = get_object_or_404(Expense, id=expense_id)
        data = json.loads(request.body)
        serializer = ExpenseSerializer(expense, data=data, partial=True)
        if serializer.is_valid():
            updated_expense = serializer.save()
            return Response({
                'success': True,
                'expense': ExpenseSerializer(updated_expense).data
            })
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_expense(request, expense_id):
    """Delete an expense"""
    try:
        expense = get_object_or_404(Expense, id=expense_id)
        expense.delete()
        return Response({
            'success': True,
            'message': 'Expense deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Contributions API endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def api_contributions(request):
    """Get all contributions"""
    try:
        contributions = Contribution.objects.all().order_by('-created_at')
        serializer = ContributionSerializer(contributions, many=True)
        return Response({
            'success': True,
            'contributions': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def api_create_contribution(request):
    """Create a new contribution"""
    try:
        data = json.loads(request.body)
        serializer = ContributionSerializer(data=data)
        if serializer.is_valid():
            contribution = serializer.save()
            return Response({
                'success': True,
                'contribution': ContributionSerializer(contribution).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def api_update_contribution(request, contribution_id):
    """Update a contribution"""
    try:
        contribution = get_object_or_404(Contribution, id=contribution_id)
        data = json.loads(request.body)
        serializer = ContributionSerializer(contribution, data=data, partial=True)
        if serializer.is_valid():
            updated_contribution = serializer.save()
            return Response({
                'success': True,
                'contribution': ContributionSerializer(updated_contribution).data
            })
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_delete_contribution(request, contribution_id):
    """Delete a contribution"""
    try:
        contribution = get_object_or_404(Contribution, id=contribution_id)
        contribution.delete()
        return Response({
            'success': True,
            'message': 'Contribution deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




