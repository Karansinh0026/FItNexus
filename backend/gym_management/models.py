
class Notice(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='notices')
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.gym.name} - {self.title}"

