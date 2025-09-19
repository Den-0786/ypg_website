from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_teammember_is_council'),
    ]

    operations = [
        migrations.AddField(
            model_name='teammember',
            name='position_order',
            field=models.IntegerField(default=999),
        ),
        migrations.AddField(
            model_name='pastexecutive',
            name='position_order',
            field=models.IntegerField(default=999),
        ),
    ]


