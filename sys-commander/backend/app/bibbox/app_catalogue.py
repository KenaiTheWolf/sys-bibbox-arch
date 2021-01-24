# -*- coding: utf-8 -*-
import simplejson

from sqlalchemy import inspect

from backend.app import db
from sqlalchemy.sql import func

from backend.app.models.catalogue import Catalogue
from backend.app.services.catalogue_service import CatalogueService

from backend.app.celerytasks.tasks  import syncAppCatalogue

catalogue_service = CatalogueService()

class AppCatalogue():

  """Controler Class for the BIBBOX APPS """

  def __init__(self):
      pass

  def availableCatalogues (self):
      # read the list of available catalogues from the Config File, don't store it as instance variable
      return ['bibbox', 'eB3Kit']  

  def activeCatalogue (self):
      # read the acive catalogue Config File, don't store it as instance variable
      return 'bibbox'  

  def appNames  (self, catalogueName):
      syncAppCatalogue.delay ( self.availableCatalogues() )
      c = catalogue_service.catalogue (catalogueName).as_dict()   
      apps = simplejson.loads(c['content'])  
      
      appDescr = {}
      for app_groups in apps:
          for group_member in app_groups ['group_members']:
             app_name =  group_member ['app_name']
             appDescr[app_name]  = 'https://github.com/bibbox/' + app_name
      
      appNames = sorted (list(appDescr))
      return  appNames 

  def appDescriptions  (self, catalogueName):
      syncAppCatalogue.delay ( self.availableCatalogues() )
      c = catalogue_service.catalogue (catalogueName) 
      apps = []
      if c:  
          apps = simplejson.loads(c['content'])  
          for app_groups in apps:
              for group_member in app_groups ['group_members']:
                group_member['icon_url'] = 'https://raw.githubusercontent.com/bibbox/' +  group_member['app_name'] + '/master/icon.png'
      return apps

  def appDescription   (self, catalogueName, appName):
      return []  
