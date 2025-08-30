# Generated manually to fix phone field naming

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_exercise_routine'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='phone_number',
            new_name='phone',
        ),
        migrations.RenameField(
            model_name='gym',
            old_name='phone_number',
            new_name='phone',
        ),
    ]



