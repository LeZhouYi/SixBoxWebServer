from flask import Blueprint, render_template

MoviePlayerBp = Blueprint('movie', __name__)


@MoviePlayerBp.route("/movieplayer.html")
def home_page():
    return render_template("movieplayer.html")