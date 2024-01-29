from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from .models import DataSetModel

import json


def ml_save_data(request):
        if request.method == 'POST':
            data = json.loads(request.body)
            new_data = DataSetModel.objects.create(field=json.dumps(data))
            new_data.save()
            return JsonResponse(data)
        return JsonResponse({'message': 'return'})
