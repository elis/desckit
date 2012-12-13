# Desckit

Custom descktop wallpaper generator with NodeJS and PhantomJS

## Installation
Clone and run the application on your local computer

```shell
$ git clone git://github.com/elis/desckit.git
$ cd desckit
$ node .
```

Once ready, navigate your browser to `http://localhost:1280/assemble/wide/` to preview the `wide` script and it's output.

To generate a desktop wallpaper append `render` to the url (like so: `http://localhost:1280/assemble/wide/render/` which will create a new file (or overwrite existing one) in `/desckit/walls/` directory.

There is a simple reload mechanism that will generate the wallpaper in intervals if you append a seconds interval to the end of the url (like so: `http://localhost:1280/assemble/wide/render/60`) which will reload the page once every 60 seconds.

## Windows Configuration

To display your wallpaper in Windows 7/8 use the built in wallpaper rotation tool.

 1. Right click anywhere on your descktop
 2. Select `Personalize` (the lower-most item)
 3. Select `Desktop Background` in the bottom area of the window
 4. Click on `Browse...` next to `Picture location:` dropdown
 5. Locate and select the `/desckit/walls` directory
 6. Select the update interval (I use 1 minute), make sure `Shuffle` is not marked
 7. Click `Save changes`

If you configured the application correctly you will now see the generated wallpaper showing on your desktop.

## Custom Scripts

The application supports custom scripts to be created. To see existing scripts navigate to `/desckit/public/scripts/`. Right now there are two scripts, `eli1` and `wide`.

### Script Files

There are currently 3 mandatory script files:

 - `script.ejs` - This is the HTML template for the layout of the descktop wallpaper
 - `script.js` - This is the Server-side(!!) script to be ran when the script is requested. This runs in your NodeJS instance so you can configure it to do whatever you want that is supported by NodeJS
 - `script.styl`- This is the Stylus CSS source file that will generate a `script.css` file when needed

Change those files to create your own customized descktop backgrounds.

# Examples

The two provided examples are `eli1` and `wide`, the main difference is that `wide`-version is created from a wide background image which is scrolled a little bit every time a wallpaper generate, so once it's on desktop it shows a wallpaper that moves just slightly, and creates a more dynamic desktop environment.

## Possibilities

Since this is basically a web-page being rendered into a desktop background, there are a lot of things that can be done with it; just to give you some direction:

 - Use HD Youtube or Vimeo videos as backgrounds
 - Display a different style based on the time of day
 - Display news headlines
 - Display HackerNews threads
 - Show top pics from /r/pics/
 - Use parallax effects

Since this is being rendered on a WebKit based browser, basically anything that you can think of creating with HTML5 can be rendered onto your desktop.

### General Information

At this point the application is in preview/alpha version designed to show the capabilities of this technique. Most of the configuration is hard-coded (like the screen-resolution), you are welcome to change it to fit your needs.

## Contact

Created by Eli Sklar

Email: eli.sklar@gmail.com

Twitter: @EliSklar