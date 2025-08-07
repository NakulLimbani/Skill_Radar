from sqlalchemy import create_engine, inspect

# Update the path to your actual database file if needed
engine = create_engine("sqlite:///db/db.sqlite") # Correct path for your project
inspector = inspect(engine)

print("Tables in the database:")
for table_name in inspector.get_table_names():
    print(table_name)