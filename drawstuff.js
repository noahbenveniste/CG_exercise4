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
    
        // Send color to console
    toConsole() {
        console.log(this.r +" "+ this.g +" "+ this.b +" "+ this.a);
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

// simple interpolate and draw with two edges
// expects two left and right edge parameters, each a two element array of objects
// the first object in each edge is the upper endpoint, the second the lower
// vertex objects have this structure: {x:float,y:float,c:Color}
// assumes the range of y coordinates spanned by the edges is the same
function twoEdgeInterp(imagedata,le,re) {
    
    // set up the vertical interpolation
    var vDelta = 1 / (le[1].y-le[0].y); // norm'd vertical delta
    var lc = le[0].c.clone();  // left color
    var rc = re[0].c.clone();  // right color
    var lcDelta = le[1].c.clone().subtract(le[0].c).scale(vDelta); // left vertical color delta
    var rcDelta = re[1].c.clone().subtract(re[0].c).scale(vDelta); // right vertical color delta
    var lx = Math.ceil(le[0].x); // left x coord
    var rx = re[0].x; // right x coord
    var lxDelta = (le[1].x - le[0].x) * vDelta; // left vertical x delta
    var rxDelta = (re[1].x - re[0].x) * vDelta; // right vertical x delta
    
    // set up the horizontal interpolation
    var hDelta = 1 / (re[0].x-le[0].x); // norm'd horizontal delta
    var hc = new Color(); // horizontal color
    var hcDelta = new Color(); // horizontal color delta
    
    // do the interpolation
    for (var y=le[0].y; y<=le[1].y; y++) {
        hc.copy(lc); // begin with the left color
        hcDelta.copy(rc).subtract(lc).scale(hDelta); // reset horiz color delta
        for (var x=Math.ceil(lx); x<=rx; x++) {
            drawPixel(imagedata,x,y,hc);
            hc.add(hcDelta);
        } // end horizontal
        lc.add(lcDelta);
        rc.add(rcDelta);
        lx += lxDelta;
        rx += rxDelta; 
    } // end vertical
} // end twoEdgeInterp

// fills the passed convex polygon
// expects an array of vertices, listed in clockwise order
// vertex objects have this structure: {x:float,y:float,c:Color}
function fillPoly(imagdata,vArray) {
    
    // compares the edges starting at v1 and v2
    // an edge is formed by the passed and subsequent vertices (with wrapping)
    // expects two vertex indices into vArray
    function compareEdgeY(v1,v2) {
        
        var e1MinY = Math.min(vArray[v1].y,vArray[(v1+1)%vArray.length].y);
        var e2MinY = Math.min(vArray[v2].y,vArray[(v2+1)%vArray.length].y);
        
        return(Math.sign(e1MinY-e2MinY));
    } // end compareEdgeY
    
    // sort the edges in the polygon by their max y coordinate
    var sortedVertIndices = vArray.keys.sort(compareEdgeY);
    console.log(sortedVertIndices.toString());
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
        [{x:50,y:50,c:new Color(255,0,0,255)}, {x:100,y:150,c:new Color(0,0,255,255)},
         {x:250,y:50,c:new Color(0,255,0,255)}, {x:200,y:150,c:new Color(0,0,0,255)}]);
    
    context.putImageData(imagedata, 0, 0); // display the image in the context
}
