"""
Shop backend package.

If mysqlclient (the fast, compiled MySQL driver) isn't installed — which
commonly happens on Windows without a C compiler — fall back to PyMySQL,
a pure-Python driver that needs no compilation and is a drop-in
replacement for Django's purposes.
"""
try:
    import MySQLdb  # noqa: F401
except ImportError:
    import pymysql
    pymysql.install_as_MySQLdb()
