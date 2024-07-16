from flask import Blueprint, render_template

HomeBp = Blueprint('home', __name__)


@HomeBp.route("/home.html")
def home_page():
    return render_template("home.html")


@HomeBp.route("/")
def index():
    return render_template("home.html")
