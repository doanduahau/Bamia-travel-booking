from django.db import models

class Destination(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

class Tour(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='tours')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=50) # vd: "3 days 2 nights"
    image = models.ImageField(upload_to='tours/', null=True, blank=True)
    rating = models.FloatField(default=0.0)
    available_slots = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title