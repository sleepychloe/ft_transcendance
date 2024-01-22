from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from .models import DataSetModel


def index(request):
    return render(request, 'game/index.html')

def local_pvp(request):
    return render(request, 'game/local_pvp.html')

def ml_save_data(request):
        if request.method == 'POST':
                data = json.loads(request.body)
                new_data = DataSetModel(column1=data)
                new_data.save()
                return JsonResponse({'message': 'Data Save OK'})
        return JsonResponse({'message': 'Invalid Request Method'})
