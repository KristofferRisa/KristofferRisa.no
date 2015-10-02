import webapp2
from google.appengine.ext import db


class Blogs(db.Model):
    title = db.StringProperty(required = True)
    subject = db.StringProperty(required = True)
    content = db.TextProperty(required = True)
    keywords = db.TextProperty()
    url = db.TextProperty(required = True)
    created = db.DateTimeProperty(auto_now_add = True)