// this script is written
// for Bitmaoboogie and [Reporter Ohne Grenzen]
// 
// Copyright (c)  2013
// Fabian "fabiantheblind" Morón Zirfas
// Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to  permit persons to
// whom the Software is furnished to do so, subject to
// the following conditions:
// The above copyright notice and this permission notice
// shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTIO
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// see also http://www.opensource.org/licenses/mit-license.php

(function(thisObj){
// basic panel
bb_imagescanner(thisObj);

 function bb_imagescanner(thisObj){

// this is global
bb_data =  {
  'text':"",
  'scanres':null,
  'imagecolors':[],
  'stepval':20,
  'imagewidth':0,
  'imageheight':0
};


///   THIS WILL CHECK IF PANEL IS DOCKABLE OR FLAOTING WINDOW  
var win   = buildUI(thisObj );
if ((win !== null) && (win instanceof Window)) {
    win.center();
    win.show();
} // end if win  null and not a instance of window 

/**
 * the User interface
 * @param  {[type]} thisObj [description]
 * @return {Panel}         [description]
 */
 function buildUI (thisObj  ) {

        var H = 25; // the height
        var W = 40; // the width
        var G = 5; // the gutter
        var x = G;
        var y = G;
        var rows = 6;
        var columns = 5;
    var win = (thisObj instanceof Panel) ? thisObj :  new Window('palette', 'Bitmaoboogie Imagescanner',[0,0,W*columns+ 2*G,H*rows + 2*G],{resizeable: true});

    if (win !== null) {

        win.read_it_button = win.add('button',[x ,y,x+W*5,y + H],'read it');
        x=G;
        y+=(H*1)+G;
        win.textfield = win.add('edittext',[x,y,x+W*5,y+H*4],'',{multiline:true});
        x=G;
        y+=(H*4) + G;
        win.steps_etext = win.add('edittext',[x ,y,(x+W*2) - (G/2),y + H],bb_data.stepval);
        x = (x+W*2) + (G/2);
        win.do_it_button = win.add('button', [x ,y,x+W*3,y + H], 'do it');

        win.steps_etext.onChange = function  () {

          var buff = bb_data.stepval;
            bb_data.stepval = parseInt(this.text,10);//parseTextToFloat(this.value, , 1, 100000000,1);
            if(isNaN(bb_data.stepval)){
                alert('Sorry this is not a integer point value\nReset to '+buff);
                this.text = buff;
                bb_data.stepval = buff;
            }
        };
        win.read_it_button.onClick = function  () {
          importdata();
          if(bb_data.imagecolors.length < 1){

          alert("The import did not work :(");
          }else{
            alert("woohoo! \\o/ the import went fine. I got " +bb_data.imagecolors.length+ " color values");
          }
        };
        win.textfield.onChange = function  () {
          bb_data.text = this.text;
        };
        win.do_it_button.onClick = function () {
          if(bb_data.text.length < 1){
            alert("you need to enter some text first");
            return;
          }
          var numoflayers = Math.floor(bb_data.imagecolors.length / bb_data.stepval);
          if(numoflayers > 300){
            var res = confirm("Uh. This with a step value of " + bb_data.stepval+ " and "+ bb_data.imagecolors.length +" this will result in " + numoflayers +" layers. Are you sure you want to do this?\n if not please enter a higher value into the step textfield",true,"To many layers?");
            if(res === true){
              runit();
            }else{
              return;
            }
          }else{
            runit();
          }

      };

    }
    return win;
}

/**
 * imports the data and adds them to the global object
 * 
 * @return nothing
 */
function importdata(){
  var lines = read_in_txt();
  // alert(lines);
  var raw_data = lines.join("");
  // alert(raw_data);
  var json = eval("(" + raw_data + ")");
  var resol = json.scanresolution;
  bb_data.scanres = json.scanresolution;
  bb_data.imagewidth = json.width;
  bb_data.imageheight = json.height;
  var progress_win = new Window ("palette");

var progress = progress_bar(progress_win, json.colors.length, 'Importing data. Please be patient');
 for(var i = 0; i < json.colors.length;i++){
bb_data.imagecolors.push(json.colors[i]);
      progress.value = i+1;
 }
    progress.parent.close();

return 0;
}
/**
 * Taken from ScriptUI by Peter Kahrel
 * 
 * @param  {Palette} w    the palette the progress is shown on
 * @param  {[type]} stop [description]
 * @return {[type]}      [description]
 */
function progress_bar (w, stop, labeltext) {
var txt = w.add('statictext',undefined,labeltext);
var pbar = w.add ("progressbar", undefined, 1, stop); pbar.preferredSize = [300,20];
w.show ();
return pbar;
}

/**
 * run the action
 * @return nothing
 */
function runit(){
// "in function main. From here on it is a straight run"
// 

    var curComp = app.project.activeItem;
   if (!curComp || !(curComp instanceof CompItem)){
        alert('please select a comp');
        return;
    }
    app.beginUndoGroup('bitmapboogie imagescanner');
    var reg = new RegExp ("\\.","g");
    var cleandwordstring = bb_data.text.replace(reg,"");
    var words = cleandwordstring.split(' ');

var progress_win = new Window ("palette");
var progress = progress_bar(progress_win,bb_data.imagecolors.length, 'Placing Text. This may take a while');

    for(var i = 0; i < bb_data.imagecolors.length; i+=bb_data.stepval){
      var current_word = words[i%words.length];
      var x = bb_data.imagecolors[i].x;
      var y = bb_data.imagecolors[i].y;
      var r = bb_data.imagecolors[i].rgba[0];
      var g = bb_data.imagecolors[i].rgba[1];
      var b = bb_data.imagecolors[i].rgba[2];
      var a = bb_data.imagecolors[i].rgba[3];
      writeLn(String(i +"/"+bb_data.imagecolors.length));
      if(a === 0){
        continue;
      }
      var average = (r+ g +b) / 3;
      // if(average < 128){
      //   continue;
      // }

      var curtl = curComp.layers.addText(current_word);
      curtl.transform.position.setValue([x,y]);
            progress.value = i+1;

    }
    progress.parent.close();

    app.endUndoGroup();
  return 0;
  }

  /**
 * this reads in a file 
 * line by line
 * @return {Array of String}
 */
function read_in_txt(){

  var textFile = File.openDialog("Select a text file to import.", "*.*",false);



        var textLines = [];
    if (textFile !== null) {
        textFile.open('r', undefined, undefined);
        while (!textFile.eof){
            textLines[textLines.length] = textFile.readln();
        }

        textFile.close();
    }

    if(!textLines){
        alert("ERROR Reading file");
        return null;
    }else{

    return textLines;
    }
  }
}// close bb_imagescanner

})(this);