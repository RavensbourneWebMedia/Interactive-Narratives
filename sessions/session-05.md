# Session 5

### Today, 14th May 

* [Sort out Git](#sort-out-git)
* [Formative presentations](#formative-presentations)
* [Saving Twine files](#saving-twine-files)
* [Running a local Web server](#running-a-local-web-server)
* [Locative games](#locative-games)

Your [homework](#homework)!




# Sort out Git

### Forking this repository 

1. Log in to [GitHub](https://github.com)
* Go to [github.com/RavensbourneWebMedia/Interactive-Narratives](https://github.com/RavensbourneWebMedia/Interactive-Narratives)
* [**Fork**](https://github.com/RavensbourneWebMedia/Interactive-Narratives#fork-destination-box) it!
* Copy the *HTTPS clone URL* of your new fork, it should look something like `https://github.com/YOUR_NAME/Interactive-Narratives.git`
* Open the [SourceTree](http://www.sourcetreeapp.com/) app
* `File > New / Clone` or `cmd + N`
* `Clone from URL`
	* Paste your *HTTPS clone URL* in the `Source URL`
	* The `Destination Path` should be an *empty* folder on your computer
	* The `Name` can be whatever you want
*	Press `Clone`
*	Once the repository is cloned and downloaded, SourceTree will open up a new window for the repo.

Remember: you will push your work to **your forked repo**, not to the original repo.

### Getting the latest files from the original repo <sup>OPTIONAL</sup> 

1.	Click on `Settings` (the cog icon on the top-right corner)
* `Remotes` > `Add`
	* `Remote name` can be whatever you want, the convention is to call it `upstream`
	* `URL / path` is `https://github.com/RavensbourneWebMedia/Interactive-Narratives.git`, which is the *HTTPS clone URL* of the original repo
* When `upstream` is added to your SourceTree left sidebar, you can right-click on it and choose `Pull from upstream...`
* This will pull (download) all the latest files from the original repository into your fork.




# Formative presentations

### Teams

1. Margot, Matt and Cal
2. Harry, Simeron and Liam 
3. Kim, Burak and Innocent

### Checklist

These are some questions that you can use to structure your formative presentation. It's not a strict checklist, pick and mix as your team pleases.

* [ ] How did [modding the verbs](session-01.md#hacking-games-with-verbs) of an existing game influence the *story* that the game tells and the *morals* it embodies?
* [ ] How did the [game-stories you analysed](session-01.md#assignment) convey a narrative through an interactive (and possibly playful) experience? What could you *steal* from them?
* [ ] What can [board games](session-02.md#board-games) teach us about storytelling? Think about *role play* (`are you a knight, a trader, a builder?` etc.) and *social play* (`who are you trading with? who are your allies and enemies?` etc.).. 
* [ ] What are the differences between writing a short story and a [twine](session-02.md#twine)?
* [ ] Can [gaming make a better world](http://www.ted.com/talks/jane_mcgonigal_gaming_can_make_a_better_world?language=en#t-464468)?
* [ ] What elements of your mystery story from last term could be told through a *game* (or *games*)?
* [ ] What are your **two game ideas**? Pitch them to us
* [ ] Would you do that with [Twine](session-02.md#twine), [Phaser](session-03.md#phaser), or both?






	 		


# Saving Twine files

Twine saves your work in the browser's [LocalStorage](http://diveintohtml5.info/storage.html).

![](assets/twine-local-storage.png)

This means that your *twines* **may be wiped** if you clear your browser's cache! 

To prevent that and safely back your work up:

1. Publish your twines by clicking the `Publish to File` button
	![](assets/twine-publish.jpg)
2. Push your story HTML file plus any linked assets (eg images) to your GitHub repo fork.


If you have images or other media **linked** inside your Twine, make sure that those links are not broken in your published twine. See [here](session-02.md#images).



# Running a *local* Web server

In case you forgot..

**Local development** is the process of building websites, apps or games from the comfort of a *virtual server*, and not needing to be connected to the Internet in order to run the *back-end* of your projects.

Web server applications (pick one):

1. [XAMP](https://www.apachefriends.org) is for Mac, Windows and Linux <sup>RECOMMENDED</sup>
* [MAMP](https://www.mamp.info/en) is for Mac (well, now for Win too)
* [WAMP](http://www.wampserver.com/en/#wampserver-64-bits-php-5-3) is for Windows

> Q: what do you think ***AMP** stand for?

### Your turn

1. Download and install one of the Web server applications above.
* Once it's done, locate the [*root folder*](https://www.google.co.uk/search?q=root+folder) from which your Web server files are served.
* Inside the root folder, create a new folder and name it whatever you please.
* Inside the new folder, create a new HTML document and name it **`index.html`**. Put some content into it (anything you like, for instance `<p>Matteo lives here</p>`)
* Open a Web browser and point it to your *root folder*

	`http://localhost` (XAMPP) or `http://localhost:8888` (MAMP)
* Navigate to your new folder, eg `http://localhost/matteo`
* What do you see?

> [URLs](http://en.wikipedia.org/wiki/Uniform_resource_locator) are just **paths to files** and folders on a server (either on your `localhost` or on some `remote server`).

See [why Phaser needs a local Web server](http://phaser.io/tutorials/getting-started)


# Locative games

Often in videogames you control a character that navigates a **map**.

What is a map? An **abstraction**, like a game.

[![The map is not the territory](assets/map-not-territory.jpg)](http://en.wikipedia.org/wiki/Map%E2%80%93territory_relation)

How about a **real** map? 

Change the **scale**, take the game **beyond** the screen..


### Ingredients

* [Leaflet](http://leafletjs.com/): an Open-Source JS library for mobile-friendly interactive maps
* Fancy map tiles: [MapBox](https://www.mapbox.com)
* [HTML5 geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
* [Phaser maze](http://phaser.io/tutorials/coding-tips-005)


### Method


### Resources

* [How do Web maps work?](https://www.mapbox.com/guides/how-web-maps-work/)
* [JavaScript Custom Events](http://davidwalsh.name/customevent)
* [How to scale your HTML5 endless runner game to play it on mobile devices](http://www.emanueleferonato.com/2015/03/25/quick-tip-how-to-scale-your-html5-endless-runner-game-to-play-it-on-mobile-devices/)

### Inspirations

Check out [Hear us Here](http://www.hearushereapp.com)
Zombies Run?


# Homework

Using Phaser (or similar) *remix* an exploration-based game so that it tells **your** [non]linear story through space. The work may have one or more of the following features:

* Broken time-space continuum

* Non stereotypical kind of fantasy. Can you imagine a fantasy world that is not derived from Tolkien, Asimov, Disney?

* Autobiographical (not necessarily a realistic contemporary setting)

* Based in the Greenwich Peninsula (at any point in history)





