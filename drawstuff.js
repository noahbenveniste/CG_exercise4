/* classes */ 

// Color constructor
class Color {
    
        // Color constructor default opaque black
    constructor(r=0,g=0,b=0,a=255) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
                return(this);
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color change method
    
        // Color add method
    add(c) {
        try {
            if (!(c instanceof Color))
                throw "Color.add: non-color parameter";
            else {
                this.r += c.r; this.g += c.g; this.b += c.b; this.a += c.a;
                return(this);
            }
        } // end try
        
        catch(e) {
            console.log(e);
        }
    } // end color add
    
        // Color subtract method
    subtract(c) {
        try {
            if (!(c instanceof Color))
                throw "Color.subtract: non-color parameter";
            else {
                this.r -= c.r; this.g -= c.g; this.b -= c.b; this.a -= c.a;
                return(this);
            }
        } // end try
        
        catch(e) {
            console.log(e);
        }
    } // end color subgtract
    
        // Color scale method
    scale(s) {
        try {
            if (typeof(s) !== "number")
                throw "scale factor not a number";
            else {
                this.r *= s; this.g *= s; this.b *= s; this.a *= s; 
                return(this);
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color scale method
    
        // Color copy method
    copy(c) {
        try {
            if (!(c instanceof Color))
                throw "Color.copy: non-color parameter";
            else {
                this.r = c.r; this.g = c.g; this.b = c.b; this.a = c.a;
                return(this);
            }
        } // end try
        
        catch(e) {
            console.log(e);
        }
    } // end Color copy method
    
        // Color clone method
    clone() {
        var newColor = new Color();
        newColor.copy(this);
        return(newColor);
    } // end Color clone method
    
        // translate color to string
    toString() {
        return(this.r +" "+ this.g +" "+ this.b +" "+ this.a);
    }  // end Color toConsole
    
        // Send color to console
    toConsole() {
        console.log(this.toString());
    }  // end Color toConsole
    
} // end color class


/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else 
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel


/* application functions */

// interpolate and draw between two edges
// draws only in the y range occupied by both edges
// expects two left and right edge parameters, each a two element array of objects
// the first object in each edge is the upper endpoint, the second the lower
// vertex objects have this structure: {x:float,y:float,c:Color}
function twoEdgeInterp(imagedata,e1,e2) {
    
    // determine left/right edges
    if (Math.min(e1[0].x,e1[1].x) < Math.min(e2[0].x,e2[1].x))
        var le = e1, re = e2;
    else
        var le = e2, re = e1; 
    
    // ensure vertex with min y is first
    le = (le[0].y < le[1].y) ? le : le.reverse(); 
    re = (re[0].y < re[1].y) ? re : re.reverse(); 
    
    // setup interp begin for different starting Ys
    var startYDiff = le[0].y - re[0].y;
    if (startYDiff > 0) { // left edge has largest min Y
        var startAtT = startYDiff/(re[1].y - re[0].y); // start at param t
        var startAtY = Math.ceil(le[0].y); // start at min Y
        var lx = Math.ceil(le[0].x); // left x
        var lc = le[0].c.clone();  // left color
        var rx = re[0].x + (re[1].x-re[0].x) * startYDiff/(re[1].y - re[0].y); // right x
        var rc = re[1].c.clone().subtract(re[0].c).scale(startAtT).add(re[0].c);  // right color
    } else { // end if left edge largest min Y, begin right edge largest min Y
        var startAtT = -startYDiff/(le[1].y - le[0].y); // start at param t
        var startAtY = Math.ceil(re[0].y); // start at min Y
        var lx = Math.ceil(le[0].x + (le[1].x-le[0].x) * startAtT); // left x
        var lc = le[1].c.clone().subtract(le[0].c).scale(startAtT).add(le[0].c);  // left color
        var rx = re[0].x; // right x
        var rc = re[0].c.clone();  // right color
    } // end if right edge has largest min Y

    // set up the vertical interpolation
    var haltAtY = Math.min(le[1].y,re[1].y); // Y at which to stop interpolation
    var vDelta = 1 / (haltAtY-startAtY); // norm'd vertical delta
    var lcDelta = le[1].c.clone().subtract(le[0].c).scale(vDelta); // left vertical color delta
    var rcDelta = re[1].c.clone().subtract(re[0].c).scale(vDelta); // right vertical color delta
    var lxDelta = (le[1].x - le[0].x) * vDelta; // left vertical x delta
    var rxDelta = (re[1].x - re[0].x) * vDelta; // right vertical x delta
    
    // set up the horizontal interpolation
    var hDelta = 1 / (rx-lx); // norm'd horizontal delta
    var hc = new Color(); // horizontal color
    var hcDelta = new Color(); // horizontal color delta
    
    // do the interpolation
    for (var y=startAtY; y<=haltAtY; y++) { // for each pixel row edges share
        hc.copy(lc); // begin with the left color
        hcDelta.copy(rc).subtract(lc).scale(hDelta); // reset horiz color delta
        for (var x=Math.ceil(lx); x<=rx; x++) { // for each pixel in row
            drawPixel(imagedata,x,y,hc); // draw the color
            hc.add(hcDelta); // set next pixel color
        } // end horizontal
        lc.add(lcDelta); // set next left edge color
        rc.add(rcDelta); // set next right edge color
        lx += lxDelta; // set next left edge x coord
        rx += rxDelta; // set next right edge x coord
    } // end vertical
} // end twoEdgeInterp

// fills the passed convex polygon
// expects an array of vertices, listed in clockwise order
// vertex objects have this structure: {x:float,y:float,c:Color}
function fillPoly(imagedata,vArray) {
    
    // sort the edges in the polygon by their min y coordinate
    // next remove any horizontal edges
    var minYList = vArray.map(function(vtx,idx,ary) { // create array of minY index pairs
        return({minY:Math.min(vtx.y,vArray[(idx+1)%vArray.length].y), index:idx});
    }); 
    minYList.sort(function(e1,e2) { // sort array by minY
        return(Math.sign(e1.minY-e2.minY));
    });
    var sortedNoHzEdges = minYList.filter(function (vtx,idx,ary) { // filter out horizontal edges
        return(vArray[vtx.index].y !== vArray[(vtx.index+1)%vArray.length].y);
    });

    // move through sorted edges, interpolating between each minY pair
    var e1 = 0, e2 = 1; // begin with first two edges (those that begin first/have min two Ys)
    var e1v1, e1v2, e2v1, e2v2; // the vertices included in these two edges
    while (e2<sortedNoHzEdges.length) { // for each polygon vertex index in sorted filtered list
        
        // set up the vertices in the current two edges
        e1v1 = vArray[sortedNoHzEdges[e1].index];
        e1v2 = vArray[(sortedNoHzEdges[e1].index+1)%vArray.length];
        e2v1 = vArray[sortedNoHzEdges[e2].index];
        e2v2 = vArray[(sortedNoHzEdges[e2].index+1)%vArray.length];
        console.log(e1v1.x +" "+ e1v1.y +" to "+ e1v2.x +" "+ e1v2.y);
        console.log(e2v1.x +" "+ e2v1.y +" to "+ e2v2.x +" "+ e2v2.y);
        console.log(" ");
        
        // interpolate between the current two edges
        twoEdgeInterp(imagedata,[e1v1,e1v2],[e2v1,e2v2]);
        
        // discard the edge that ends first, or both if they end at same Y
        try {
            switch(Math.sign(Math.max(e1v1.y,e1v2.y)-Math.max(e2v1.y,e2v2.y))) {
                case -1: // e1 ends first
                    e1 = e2; break; // discard e1, save e2
                case 1: // e2 ends first
                    break; // save e1, discard e2
                case 0: // they end at same Y
                    e2++; e1 = e2; break; // discard both edges
                default: // something weird happened
                    throw "fillPoly: odd endpoint Y comparison. NaN?";
            } // end switch on which edge ends first
            e2++; // add new second edge
        } // end try
        
        catch (e) {
            console.error(e);
            break; // ... out of while loop
        } // end catch
    } // end for each polygon vertex index in sorted filtered list
} // end fillPoly
    

/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas, context, and image data
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    var w = context.canvas.width; // as set in html
    var h = context.canvas.height;  // as set in html
    var imagedata = context.createImageData(w,h);
 
    // Define and render a rectangle in 2D with colors and coords at corners
    fillPoly(imagedata,
        [{x:50,y:50,c:new Color(255,0,0,255)}, {x:150,y:100,c:new Color(0,255,0,255)}, 
         {x:150,y:150,c:new Color(0,0,0,255)}, {x:50,y:200,c:new Color(0,0,255,255)}]);
    
    context.putImageData(imagedata, 0, 0); // display the image in the context
}
