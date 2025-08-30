# Generated manually to add date_of_birth field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_fix_phone_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
    ]



