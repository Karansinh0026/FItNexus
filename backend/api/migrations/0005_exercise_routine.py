# Generated manually

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_notice'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExerciseRoutine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('age', models.IntegerField(validators=[django.core.validators.MinValueValidator(13), django.core.validators.MaxValueValidator(100)])),
                ('weight', models.DecimalField(decimal_places=2, help_text='Weight in kg', max_digits=5)),
                ('height', models.DecimalField(decimal_places=2, help_text='Height in cm', max_digits=5)),
                ('experience_level', models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')], max_length=20)),
                ('routine_data', models.JSONField(help_text='Structured exercise routine data')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercise_routines', to='api.user')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

