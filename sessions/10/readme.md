# Session 10

### Today, Tuesday 24th of April 2018

<img src="https://github.com/RavensbourneWebMedia/Interactive-Narratives/blob/2018/sessions/10/assets/gamingflow.png" width="900">

<img src="https://github.com/RavensbourneWebMedia/Interactive-Narratives/blob/2018/sessions/10/assets/dices.png" width="900">

* [Link to todays lecture ](https://moodle.rave.ac.uk/pluginfile.php/162738/mod_resource/content/6/Gamification.pdf)

# Lecture: Phaserrr

Phaser is an HTML5 game framework which aims to help developers make powerful, cross-browser HTML5 games really quickly. It was created specifically to harness the benefits of modern browsers, both desktop and mobile. The only browser requirement is the support of the canvas tag.

Download the source files from here:

Open the part1.html page in your editor of choice and let's have a closer look at the code. After a little boilerplate HTML that includes Phaser the code structure looks like this:

```javascript
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
}

function create ()
{
}

function update ()
{
}
```

The config object is how you configure your Phaser Game. There are lots of options that can be placed in this object and as you expand on your Phaser knowledge you'll encounter more of them. But in this tutorial we're just going to set the renderer, dimensions and a default Scene.

An instance of a Phaser.Game object is assigned to a local variable called game and the configuration object is passed to it. This will start the process of bringing Phaser to life.

The type property can be either Phaser.CANVAS, Phaser.WEBGL, or Phaser.AUTO. This is the rendering context that you want to use for your game. The recommended value is Phaser.AUTO which automatically tries to use WebGL, but if the browser or device doesn't support it it'll fall back to Canvas. The canvas element that Phaser creates will be simply be appended to the document at the point the script was called, but you can also specify a parent container in the game config should you wish.

The width and height properties set the size of the canvas element that Phaser will create. In this case 800 x 600 pixels. Your game world can be any size you like, but this is the resolution the game will display in.

The scene property of the configuration object will be covered in more detail further on in this tutorial.



# Homework

### Peer-learning mini-lessons


### Blog

Keeping a **journal** to record your creative process is extremely important. Don't let your ideas and thoughts fade away! Think of your blog as your *digital sketchbook* (more on that [here](https://github.com/RavensbourneWebMedia/Blogging#why-blogging)). We ask you to blog regularly and we'll check that you do it every week.

**When creating online content for children, what are some of the ethical considerations you need to take?**

In addition, look at the reading list for this brief and familiarise yourself with the books.
