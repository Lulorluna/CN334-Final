from django.db import models


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=50)
    detail = models.CharField(max_length=500)
    price = models.FloatField()
    stock = models.IntegerField()
    categories = models.ManyToManyField(Category, related_name="products")
    production_date = models.DateField()
    expiration_date = models.DateField()
    address = models.CharField(max_length=50, blank=True)
    available = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.available = self.stock > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
