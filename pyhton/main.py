#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# TO DO: add a blog class and a auther class. remeber to exstend blog class with both url and a auther link, maybe just have one class?

import webapp2
import jinja2
import os
import logging
from google.appengine.ext import db

from db_models import Blogs

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir),
                               autoescape = True)

def render_str(template, **params):
    t = jinja_env.get_template(template)
    return t.render(params)


class BaseHandler(webapp2.RequestHandler):
    def render(self, template, **kw):
        self.response.out.write(render_str(template, **kw))

    def render_json(self, d):
        json_txt = json.dumps(d)
        self.response.headers['Content-Type']='application/json; charset=UTF-8'
        self.write(json_txt)

    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)

    def initialize(self, *a, **kw):
        webapp2.RequestHandler.initialize(self, *a, **kw)
        if self.request.url.endswith('.json'):
            self.format = 'json'
        else:
            self.format = 'html'

class MainHandler(BaseHandler):
    def get(self):
        #self.render('content.html')
        #self.render('commingsoon.html')
        self.render('underarbeid.html')


class BlogHandler(BaseHandler):
    def get(self):
        blogs = db.GqlQuery("SELECT * FROM Blogs "
                            "ORDER BY created DESC "
                            "LIMIT 10")
        self.render('blog.html', blogs=blogs)

class NewPost(BaseHandler):
    def get(self):
        self.render('newpost.html')

    def render_newpost(self, subject="", content="", error=""):
        self.render('newpost.html', subject = subject, content= content, error = error)

    def post(self):
        subject = self.request.get("subject")
        content = self.request.get("content")
        keywords = self.request.get("keywords")
        url = self.request.get("url")

        if not url:
            error = "Url is missing"
            self.render_newpost(subject = subject, content = content, keywords = keywords, error = error)
            return
        checkUrl = db.GqlQuery("Select * from Blogs where url = '%s'" % url).get()

        if checkUrl:
            error = "URL already exists."
            self.render_newpost(subject = subject, content = content, keywords = keywords, error = error)
            return

        if subject and content:
            b = Blogs(subject = subject, content = content, keywords = keywords, url = url)
            b.put()
            self.redirect("/blog/%s" % url)
            return
        else:
            error = "We need both title and content."
            self.render_newpost(subject = subject, content = content, error = error)

class Permalink(BaseHandler):
    def get(self, url):
        post = db.GqlQuery("Select * from Blogs where url = '%s'" % url).get()

        if not post:
            self.error(404)
            return
        else:
            self.render("blog.html", blogs=[post])


class Vedlegg(BaseHandler):
    def get(self):
        self.redirect('http://goo.gl/oX2Wat')


app = webapp2.WSGIApplication([
        ('/', MainHandler),
        ('/Blog', BlogHandler),
        ('/Blog/New', NewPost),
        ('/blog/(\d+)', Permalink),
        ('/Vedlegg', Vedlegg)
], debug=True)
