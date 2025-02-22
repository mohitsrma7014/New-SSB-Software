from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('forging/', include('forging.urls')),
    path('heat_treatment/', include('heat_treatment.urls')),
    path('shot_blast/', include('shot_blast.urls')),
    path('pre_mc/', include('pre_mc.urls')),
    path('cnc/', include('cnc.urls')),
    path('marking/', include('marking.urls')),
    path('visual/', include('visual.urls')),
    path('fi/', include('fi.urls')),
    path('raw_material/', include('raw_material.urls')),
    path('costumer_complaint/', include('costumer_complaint.urls')),
    path('calibration/', include('calibration.urls')),
    path('other/', include('other.urls')),
]


from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)