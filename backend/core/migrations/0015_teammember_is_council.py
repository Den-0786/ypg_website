from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_pastexecutive'),
    ]

    operations = [
        migrations.AddField(
            model_name='teammember',
            name='is_council',
            field=models.BooleanField(default=False),
        ),
    ]


