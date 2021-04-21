
import requests 
import json 
import os
import shutil

from backend.app.bibbox.instance import InstanceDescription



# add gitpython to requirements.txt

# TODO
#
# to overcome the 'RAW CACHE' problem, we have to use git directly
# this seems to be the standard lib
# https://gitpython.readthedocs.io/en/stable/tutorial.html
#
# then it would make sense to mit the Github functions in a seperate class
# which makes a local copy/cache of the github repository with the correct 
# version. 
# 
# in offline mode, we could then just read from the local dir
#  => we need a global config saying, that we work in offline mode 
#  => and a cache-all function downling all the reproes and builiding all images
#  


class FileHandler():
    
    def __init__(self):
        self.INSTANCEPATH = "/opt/bibbox/instances/"
        self.CONFIGPATH   = "/opt/bibbox/config/"
        self.PROXYPATH    = "/opt/bibbox/proxy/"

    def copyFileFromWeb (self, fileurl, instancename, filename):
        try:
            download = requests.get(fileurl).content
        except Exception:
            raise Exception('Something went wrong during connecting to the Web. Please Check your internet connection!')

        filename =  self.INSTANCEPATH  + instancename + "/" + filename

        with open(filename, 'wb') as f:
            f.write(download)
    
    def copyFileFromGithub (self, organization, repository, version, filename, instancename, destinationfilename):
        #
        # TODO replace this with the local 'roberts' variant
        #      (after a first protype of the frontend is running) 
        #
        fileurl = self.__getBaseUrlRaw (organization, repository, version) + '/' + filename
        self.copyFileFromWeb (fileurl, instancename, destinationfilename)

    def copyAllFilesToInstanceDirectory (self, instanceDescr, logger=None):

        instancename = instanceDescr['instancename']
        organization = instanceDescr['app']['organization']
        repository = instanceDescr['app']['name']
        version    = instanceDescr['app']['version']

        for fn in ('docker-compose-template.yml', 'fileinfo.json', 'appinfo.json'):
            if logger:
                logger.info("Copying file {} from GitHub.".format(fn))
            self.copyFileFromGithub (organization, repository, version, fn , instancename,  fn)

        filename =  self.INSTANCEPATH  + instancename + "/" + 'fileinfo.json'
        with open(filename, 'r') as f:
            fileinfo = json.load (f)

        for directory_to_copy in fileinfo['makefolders']: 
            dirname =  self.INSTANCEPATH  + instancename + "/" + directory_to_copy
            if not os.path.exists(dirname):
                if logger:
                    logger.info("Creating directory: {}".format(dirname))
                os.makedirs(dirname)
            
        for file_to_copy in fileinfo['copyfiles']:
            source = file_to_copy["source"]
            destination = file_to_copy["destination"]
            if logger:
                logger.info("Copying file from {} to {}.".format(source, destination))
            if ('https://' in source or 'http://' in source):
                self.copyFileFromWeb    (source, instancename,  destination)
            else:
                self.copyFileFromGithub (organization, repository, version, source, instancename,  destination)

    def getConfigFile (self, name):
         filename =  self.CONFIGPATH  + name
         with open(filename, 'r') as f:
            content = f.read ()
         return content 

    # should we make for the config a own class, or even integrae it into the FLASK confid ?
    def getBIBBOXconfig (self):
        path =  self.CONFIGPATH  + 'bibbox.config'
        config   = self.__readJsonFile (path)
        return config
        
    def writeProxyFile (self, name, content):
         filename =  self.PROXYPATH + 'sites/' + name
         with open(filename, 'w') as f:
            f.write (content)
         return content 

    def checkDirectoryStructure(self):
        # checks if the dirs (instances, config, proxy) exist and creates them if not
        try:
            for k, v in vars(self).items():
                if not os.path.exists(v):
                    os.makedirs(v)
            status = 'ok'
        except Exception:
            status = Exception
        return status

    def updateInstanceJsonState (self, instance_name, state_to_set):
        # set state of instance
        # info: may soon be deprecated as we modify the instance / instanceDescription class

        if state_to_set in InstanceDescription().states() or state_to_set in InstanceDescription().running_state():
            try:
                self.updateInstanceJsonInfo(instance_name, {'state' : state_to_set})
            except Exception as ex:
                print(ex + " Error occurred while trying to update state in instance.json file.")

        else:            
            raise Exception("Error occurred during update of instance.json: Trying to set unknown instance state.")

            
    def updateInstanceJsonProxy (self, instance_name, proxy_content):
        proxyInfos = []
        for containerInfo in proxy_content:
            proxyInfos.append(containerInfo)

        try:     
           if proxyInfos:
               self.updateInstanceJsonInfo(instance_name, {'proxy': proxyInfos})
        except Exception as ex:
            print(ex + " Error occurred while trying to update proxy infos in instance.json file.")

    def updateInstanceJsonContainerNames (self, instance_name, container_names):
        try:     
            if container_names:
                self.updateInstanceJsonInfo(instance_name, {'container_names': container_names})
        except Exception as ex:
            print(ex + " Error occurred while trying to update container_names in instance.json file.")


    def updateInstanceJsonInfo (self, instance_name, update_dict):
        # read content from file
        content = self.__readJsonFile(self.INSTANCEPATH + instance_name + "/instance.json")

        for k, v in update_dict.items():
            content[k] = v

        # write updated content to instance.json file
        try:     
            with open(self.INSTANCEPATH + instance_name + '/instance.json', 'w+') as f:
                f.truncate(0)
                f.write (json.dumps(content))
        except IOError as ex:
            print(ex + " Error occurred while trying to update instance.json file.")


    def writeInstancesJsonFile (self):
        content = []
        for instance_name in os.listdir(self.INSTANCEPATH):
            if os.path.isdir(self.INSTANCEPATH + instance_name):
                content.append(self.__readJsonFile(self.INSTANCEPATH + instance_name + '/instance.json'))
        
        # sorts dict by instance names
        content.sort(key=lambda x: x['instancename'])

        try: 
            with open(self.INSTANCEPATH + 'instances.json', 'w+') as f:
                f.truncate(0)
                f.write (json.dumps(content))
        except IOError as ex:
            print(ex, " Error occurred while trying to write instances.json file.")

    # needs root permissions --> given as it runs inside docker container
    def removeAllFilesInDir(self, directory_path):
        print("Removing files")
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                print("Removed: {}".format(filename))
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (file_path, e))
        else:
            try:
                os.rmdir(directory_path)
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (directory_path, e))
        print("finished 'removing files' operation")

    def removeProxyConfigFile(self, instance_name):
        print("Removing Proxy Config file")
        for filename in os.listdir(self.PROXYPATH + "sites/"):
            if instance_name in filename:
                file_path = self.PROXYPATH + "sites/" + filename
                os.unlink(file_path)


    def getInstancesJSONFile (self):
        try:
            self.writeInstancesJsonFile()
        except Exception as ex:
            
            print(ex)
        
        filename =  self.INSTANCEPATH  + 'instances.json'
        with open(filename, 'r') as f:
           content = f.read ()

        return content 

    def getInstanceJSONContent(self, instance_name):
        for instance_dir_name in os.listdir(self.INSTANCEPATH):
            if instance_dir_name == instance_name and os.path.isdir(self.INSTANCEPATH + instance_dir_name):
                return self.__readJsonFile(self.INSTANCEPATH + instance_dir_name + '/instance.json')

    def __getBaseUrlRaw (self, organization, repository, version):
        burl = ''
        if version == 'development':
            burl = 'https://raw.githubusercontent.com/' + organization + '/' + repository   + '/master/'
        else:
            burl = 'https://raw.githubusercontent.com/'  + organization + '/' + repository   + '/' + version + '/'
        return burl

    def __readJsonFile (self, path):
        reader = open(path, 'r')
        try:
            c = reader.read()
            idescr = json.loads(c)
        finally:
            reader.close()
        return idescr
