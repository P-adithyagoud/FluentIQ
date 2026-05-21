from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class BaseModel(db.Model):
    """Abstract Base Model offering serialization, save/delete utilities"""
    __abstract__ = True
    
    def save(self):
        """Persists the model instance to the database"""
        db.session.add(self)
        db.session.commit()
        return self
        
    def delete(self):
        """Removes the model instance from the database"""
        db.session.delete(self)
        db.session.commit()
        
    def to_dict(self, exclude=None):
        """Converts model fields into a JSON serializable dictionary"""
        if exclude is None:
            exclude = []
            
        data = {}
        for col in self.__table__.columns:
            if col.name in exclude:
                continue
                
            value = getattr(self, col.name)
            
            # Formatting special datatypes (datetime, date, arrays)
            if isinstance(value, (datetime, date)):
                data[col.name] = value.isoformat()
            elif isinstance(value, list):
                data[col.name] = list(value)
            else:
                data[col.name] = value
                
        return data
