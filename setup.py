from setuptools import setup
from setuptools.command.develop import develop as _develop
from notebook.nbextensions import install_nbextension
from notebook.services.config import ConfigManager
import os

extension_dir = os.path.join(os.path.dirname(__file__), "qcircuit", "static")

class develop(_develop):
    def run(self):
        _develop.run(self)
        install_nbextension(extension_dir, symlink=True,
                            overwrite=True, user=True, destination="qcircuit")
        cm = ConfigManager()
        cm.update('notebook', {"load_extensions": {"qcircuit/index": True } })

setup(name='qcircuit',
      cmdclass={'develop': develop},
      version='0.2.2',
      description='Quantum to notebook!',
      url='https://github.com/savinovalex',
      author='Savinov Alexander',
      author_email='chelm@timbr.io',
      license='MIT',
      packages=['qcircuit'],
      zip_safe=False,
      data_files=[
        ('share/jupyter/nbextensions/qcircuit', [
            'qcircuit/static/index.js'
        ]),
      ],
      install_requires=[
          "ipython",
          "jupyter-react"
        ]
      )
