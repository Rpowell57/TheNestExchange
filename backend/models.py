from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Listing(Base):
    __tablename__ = "ListingTable"  # Ensure this matches the actual table name in your database

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listUserID = Column(String, nullable=False)
    listDate = Column(Date, nullable=False)
    listCategory = Column(Integer, nullable=False)
    listDescription = Column(String, nullable=False)
    listClaimDescription = Column(String, nullable=False)
    isClaimed = Column(Boolean, default=False)
    listPicture = Column(String, nullable=True)
    listPicture2 = Column(String, nullable=True)
