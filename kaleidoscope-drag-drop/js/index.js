(function() {
  // Kaleidoscope
  var DragDrop, Kaleidoscope, c, dragger, gui, i, image, kaleidoscope, len, onChange, onMouseMoved, options, ref, tr, tx, ty, update;

  Kaleidoscope = (function() {
    class Kaleidoscope {
      constructor(options1 = {}) {
        var key, ref, ref1, val;
        this.options = options1;
        this.defaults = {
          offsetRotation: 0.0,
          offsetScale: 1.0,
          offsetX: 0.0,
          offsetY: 0.0,
          radius: 260,
          slices: 12, //this is NOT where you actually can change the slice  amounts. 
          zoom: 1.0 //this will adjust the ZOOMMMMMMM in
        };
        ref = this.defaults;
        for (key in ref) {
          val = ref[key];
          this[key] = val;
        }
        ref1 = this.options;
        for (key in ref1) {
          val = ref1[key];
          this[key] = val;
        }
        if (this.domElement == null) {
          this.domElement = document.createElement('canvas');
        }
        if (this.context == null) {
          this.context = this.domElement.getContext('2d');
        }
        if (this.image == null) {
          this.image = document.createElement('img');
        }
      }

      draw() {
        var cx, i, index, ref, results, scale, step;
        this.domElement.width = this.domElement.height = this.radius * 2;
        this.context.fillStyle = this.context.createPattern(this.image, 'repeat');
        scale = this.zoom * (this.radius / Math.min(this.image.width, this.image.height));
        step = this.TWO_PI / this.slices;
        cx = this.image.width / 2;
        results = [];
        for (index = i = 0, ref = this.slices; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
          this.context.save();
          this.context.translate(this.radius, this.radius);
          this.context.rotate(index * step);
          this.context.beginPath();
          this.context.moveTo(-0.5, -0.5);
          this.context.arc(0, 0, this.radius, step * -0.51, step * 0.51);
          this.context.lineTo(0.5, 0.5);
          this.context.closePath();
          this.context.rotate(this.HALF_PI);
          this.context.scale(scale, scale);
          this.context.scale([-1, 1][index % 2], 1);
          this.context.translate(this.offsetX - cx, this.offsetY);
          this.context.rotate(this.offsetRotation);
          this.context.scale(this.offsetScale, this.offsetScale);
          this.context.fill();
          results.push(this.context.restore());
        }
        return results;
      }

    };

    Kaleidoscope.prototype.HALF_PI = Math.PI / 2;

    Kaleidoscope.prototype.TWO_PI = Math.PI * 2;

    return Kaleidoscope;

  }).call(this);

  // Drag & Drop
  DragDrop = class DragDrop {
    constructor(callback, context = document, filter = /^image/i) {
      var disable;
      this.onDrop = this.onDrop.bind(this);
      this.callback = callback;
      this.context = context;
      this.filter = filter;
      disable = function(event) {
        event.stopPropagation();
        return event.preventDefault();
      };
      this.context.addEventListener('dragleave', disable);
      this.context.addEventListener('dragenter', disable);
      this.context.addEventListener('dragover', disable);
      this.context.addEventListener('drop', this.onDrop, false);
    }

    onDrop(event) {
      var file, reader;
      event.stopPropagation();
      event.preventDefault();
      file = event.dataTransfer.files[0];
      if (this.filter.test(file.type)) {
        reader = new FileReader;
        reader.onload = (event) => {
          return typeof this.callback === "function" ? this.callback(event.target.result) : void 0;
        };
        return reader.readAsDataURL(file);
      }
    }

  };

  // Init kaleidoscope
  image = new Image;

  image.onload = () => {
    return kaleidoscope.draw();
  };

  image.src = 'http://senselab.ca/wp2/wp-content/uploads/2016/08/Screen-Shot-2015-03-17-at-11.48.30-PM.jpg';
	
	//for some reason this won't process a locally hosted image. it will only work if i give an address of an image hosted online. So. it may have to do with server stide stuff... though it's still weird. this is annoying because i'd hoped to simply cite a generic images/ folder n+1 etc. 

  kaleidoscope = new Kaleidoscope({
    image: image,
    slices: 4
  });

  kaleidoscope.domElement.style.position = 'absolute';

  kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';

  kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';

  kaleidoscope.domElement.style.left = '50%';

  kaleidoscope.domElement.style.top = '50%';

  document.body.appendChild(kaleidoscope.domElement);

  
  // Init drag & drop
  dragger = new DragDrop(function(data) {
    return kaleidoscope.image.src = data;
  });

  
  // Mouse events
  tx = kaleidoscope.offsetX;

  ty = kaleidoscope.offsetY;

  tr = kaleidoscope.offsetRotation;

  onMouseMoved = (event) => {
    var cx, cy, dx, dy, hx, hy;
    cx = window.innerWidth / 2;
    cy = window.innerHeight / 2;
    dx = event.pageX / window.innerWidth;
    dy = event.pageY / window.innerHeight;
    hx = dx - 0.5;
    hy = dy - 0.5;
    tx = hx * kaleidoscope.radius * -2;
    ty = hy * kaleidoscope.radius * 2;
    return tr = Math.atan2(hy, hx);
  };

  window.addEventListener('mousemove', onMouseMoved, false);

  
  // Init
  options = {
    interactive: true,
    ease: 0.1
  };

  (update = () => {
    var delta, theta;
    if (options.interactive) {
      delta = tr - kaleidoscope.offsetRotation;
      theta = Math.atan2(Math.sin(delta), Math.cos(delta));
      kaleidoscope.offsetX += (tx - kaleidoscope.offsetX) * options.ease;
      kaleidoscope.offsetY += (ty - kaleidoscope.offsetY) * options.ease;
      kaleidoscope.offsetRotation += (theta - kaleidoscope.offsetRotation) * options.ease;
      kaleidoscope.draw();
    }
    return setTimeout(update, 1000 / 60);
  })();

  
  // Init gui
  gui = new dat.GUI;

  gui.add(kaleidoscope, 'zoom').min(0.25).max(2.0);

  gui.add(kaleidoscope, 'slices').min(6).max(32).step(2);

  gui.add(kaleidoscope, 'radius').min(200).max(500);

  gui.add(kaleidoscope, 'offsetX').min(-kaleidoscope.radius).max(kaleidoscope.radius).listen();

  gui.add(kaleidoscope, 'offsetY').min(-kaleidoscope.radius).max(kaleidoscope.radius).listen();

  gui.add(kaleidoscope, 'offsetRotation').min(-Math.PI).max(Math.PI).listen();

  gui.add(kaleidoscope, 'offsetScale').min(0.5).max(4.0);

  gui.add(options, 'interactive').listen();

  gui.close();

  onChange = () => {
    kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
    kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
    options.interactive = false;
    return kaleidoscope.draw();
  };

  ref = gui.__controllers;
  for (i = 0, len = ref.length; i < len; i++) {
    c = ref[i];
    (c.property !== 'interactive' ? c.onChange(onChange) : void 0);
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsUUFBQSxFQUFBLFlBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLFlBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBOztFQUdNO0lBQU4sTUFBQSxhQUFBO01BS0UsV0FBYSxZQUFhLENBQUEsQ0FBYixDQUFBO0FBRVgsWUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtRQUZhLElBQUMsQ0FBQTtRQUVkLElBQUMsQ0FBQSxRQUFELEdBQ0U7VUFBQSxjQUFBLEVBQWdCLEdBQWhCO1VBQ0EsV0FBQSxFQUFhLEdBRGI7VUFFQSxPQUFBLEVBQVMsR0FGVDtVQUdBLE9BQUEsRUFBUyxHQUhUO1VBSUEsTUFBQSxFQUFRLEdBSlI7VUFLQSxNQUFBLEVBQVEsRUFMUjtVQU1BLElBQUEsRUFBTTtRQU5OO0FBUUY7UUFBQSxLQUFBLFVBQUE7O1VBQUEsSUFBRyxDQUFBLEdBQUEsQ0FBSCxHQUFXO1FBQVg7QUFDQTtRQUFBLEtBQUEsV0FBQTs7VUFBQSxJQUFHLENBQUEsR0FBQSxDQUFILEdBQVc7UUFBWDs7VUFFQSxJQUFDLENBQUEsYUFBYyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2Qjs7O1VBQ2YsSUFBQyxDQUFBLFVBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLENBQXVCLElBQXZCOzs7VUFDWixJQUFDLENBQUEsUUFBUyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2Qjs7TUFoQkM7O01Ba0JiLElBQU0sQ0FBQSxDQUFBO0FBRUosWUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEtB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S0FBSyxDQUFDLFNBQTlCLEdBQTBDLENBQUMsWUFBWSxDQUFDLE1BQWQsR0FBdUI7SUFFakUsT0FBTyxDQUFDLFdBQVIsR0FBc0I7V0FFbkIsWUFBWSxDQUFDLElBQWhCLENBQUE7RUFQUzs7QUFTWDtFQUFBLEtBQUEscUNBQUE7O0lBQUEsQ0FBNkIsQ0FBQyxDQUFDLFFBQUYsS0FBYyxhQUF6QyxHQUFBLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBWCxDQUFBLEdBQUEsTUFBRjtFQUFBO0FBNUtBIiwic291cmNlc0NvbnRlbnQiOlsiXG4jIEthbGVpZG9zY29wZVxuICBcbmNsYXNzIEthbGVpZG9zY29wZVxuICBcbiAgSEFMRl9QSTogTWF0aC5QSSAvIDJcbiAgVFdPX1BJOiBNYXRoLlBJICogMlxuICBcbiAgY29uc3RydWN0b3I6ICggQG9wdGlvbnMgPSB7fSApIC0+XG4gICAgXG4gICAgQGRlZmF1bHRzID1cbiAgICAgIG9mZnNldFJvdGF0aW9uOiAwLjBcbiAgICAgIG9mZnNldFNjYWxlOiAxLjBcbiAgICAgIG9mZnNldFg6IDAuMFxuICAgICAgb2Zmc2V0WTogMC4wXG4gICAgICByYWRpdXM6IDI2MFxuICAgICAgc2xpY2VzOiAxMlxuICAgICAgem9vbTogMS4wXG4gICAgICAgIFxuICAgIEBbIGtleSBdID0gdmFsIGZvciBrZXksIHZhbCBvZiBAZGVmYXVsdHNcbiAgICBAWyBrZXkgXSA9IHZhbCBmb3Iga2V5LCB2YWwgb2YgQG9wdGlvbnNcbiAgICAgIFxuICAgIEBkb21FbGVtZW50ID89IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICBAY29udGV4dCA/PSBAZG9tRWxlbWVudC5nZXRDb250ZXh0ICcyZCdcbiAgICBAaW1hZ2UgPz0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnaW1nJ1xuICAgIFxuICBkcmF3OiAtPlxuICAgIFxuICAgIEBkb21FbGVtZW50LndpZHRoID0gQGRvbUVsZW1lbnQuaGVpZ2h0ID0gQHJhZGl1cyAqIDJcbiAgICBAY29udGV4dC5maWxsU3R5bGUgPSBAY29udGV4dC5jcmVhdGVQYXR0ZXJuIEBpbWFnZSwgJ3JlcGVhdCdcbiAgICBcbiAgICBzY2FsZSA9IEB6b29tICogKCBAcmFkaXVzIC8gTWF0aC5taW4gQGltYWdlLndpZHRoLCBAaW1hZ2UuaGVpZ2h0IClcbiAgICBzdGVwID0gQFRXT19QSSAvIEBzbGljZXNcbiAgICBjeCA9IEBpbWFnZS53aWR0aCAvIDJcblxuICAgIGZvciBpbmRleCBpbiBbIDAuLkBzbGljZXMgXVxuICAgICAgXG4gICAgICBAY29udGV4dC5zYXZlKClcbiAgICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBAcmFkaXVzLCBAcmFkaXVzXG4gICAgICBAY29udGV4dC5yb3RhdGUgaW5kZXggKiBzdGVwXG4gICAgICBcbiAgICAgIEBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgICBAY29udGV4dC5tb3ZlVG8gLTAuNSwgLTAuNVxuICAgICAgQGNvbnRleHQuYXJjIDAsIDAsIEByYWRpdXMsIHN0ZXAgKiAtMC41MSwgc3RlcCAqIDAuNTFcbiAgICAgIEBjb250ZXh0LmxpbmVUbyAwLjUsIDAuNVxuICAgICAgQGNvbnRleHQuY2xvc2VQYXRoKClcbiAgICAgIFxuICAgICAgQGNvbnRleHQucm90YXRlIEBIQUxGX1BJXG4gICAgICBAY29udGV4dC5zY2FsZSBzY2FsZSwgc2NhbGVcbiAgICAgIEBjb250ZXh0LnNjYWxlIFstMSwxXVtpbmRleCAlIDJdLCAxXG4gICAgICBAY29udGV4dC50cmFuc2xhdGUgQG9mZnNldFggLSBjeCwgQG9mZnNldFlcbiAgICAgIEBjb250ZXh0LnJvdGF0ZSBAb2Zmc2V0Um90YXRpb25cbiAgICAgIEBjb250ZXh0LnNjYWxlIEBvZmZzZXRTY2FsZSwgQG9mZnNldFNjYWxlXG4gICAgICBcbiAgICAgIEBjb250ZXh0LmZpbGwoKVxuICAgICAgQGNvbnRleHQucmVzdG9yZSgpXG5cbiMgRHJhZyAmIERyb3BcbiAgXG5jbGFzcyBEcmFnRHJvcFxuICBcbiAgY29uc3RydWN0b3I6ICggQGNhbGxiYWNrLCBAY29udGV4dCA9IGRvY3VtZW50LCBAZmlsdGVyID0gL15pbWFnZS9pICkgLT5cbiAgICBcbiAgICBkaXNhYmxlID0gKCBldmVudCApIC0+XG4gICAgICBkbyBldmVudC5zdG9wUHJvcGFnYXRpb25cbiAgICAgIGRvIGV2ZW50LnByZXZlbnREZWZhdWx0XG4gICAgXG4gICAgQGNvbnRleHQuYWRkRXZlbnRMaXN0ZW5lciAnZHJhZ2xlYXZlJywgZGlzYWJsZVxuICAgIEBjb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIgJ2RyYWdlbnRlcicsIGRpc2FibGVcbiAgICBAY29udGV4dC5hZGRFdmVudExpc3RlbmVyICdkcmFnb3ZlcicsIGRpc2FibGVcbiAgICBAY29udGV4dC5hZGRFdmVudExpc3RlbmVyICdkcm9wJywgQG9uRHJvcCwgbm9cbiAgICAgIFxuICBvbkRyb3A6ICggZXZlbnQgKSA9PlxuICAgIFxuICAgIGRvIGV2ZW50LnN0b3BQcm9wYWdhdGlvblxuICAgIGRvIGV2ZW50LnByZXZlbnREZWZhdWx0XG4gICAgICBcbiAgICBmaWxlID0gZXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzWzBdXG4gICAgXG4gICAgaWYgQGZpbHRlci50ZXN0IGZpbGUudHlwZVxuICAgICAgXG4gICAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgICAgcmVhZGVyLm9ubG9hZCA9ICggZXZlbnQgKSA9PiBAY2FsbGJhY2s/IGV2ZW50LnRhcmdldC5yZXN1bHRcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMIGZpbGVcblxuIyBJbml0IGthbGVpZG9zY29wZVxuICBcbmltYWdlID0gbmV3IEltYWdlXG5pbWFnZS5vbmxvYWQgPSA9PiBkbyBrYWxlaWRvc2NvcGUuZHJhd1xuaW1hZ2Uuc3JjID0gJ2h0dHBzOi8vY2wubHkvaW1hZ2UvMVgzZTB1MVEwTTAxL2NtLmpwZydcblxua2FsZWlkb3Njb3BlID0gbmV3IEthbGVpZG9zY29wZVxuICBpbWFnZTogaW1hZ2VcbiAgc2xpY2VzOiAyMFxuXG5rYWxlaWRvc2NvcGUuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbmthbGVpZG9zY29wZS5kb21FbGVtZW50LnN0eWxlLm1hcmdpbkxlZnQgPSAta2FsZWlkb3Njb3BlLnJhZGl1cyArICdweCdcbmthbGVpZG9zY29wZS5kb21FbGVtZW50LnN0eWxlLm1hcmdpblRvcCA9IC1rYWxlaWRvc2NvcGUucmFkaXVzICsgJ3B4J1xua2FsZWlkb3Njb3BlLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICc1MCUnXG5rYWxlaWRvc2NvcGUuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnNTAlJ1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBrYWxlaWRvc2NvcGUuZG9tRWxlbWVudFxuICBcbiMgSW5pdCBkcmFnICYgZHJvcFxuXG5kcmFnZ2VyID0gbmV3IERyYWdEcm9wICggZGF0YSApIC0+IGthbGVpZG9zY29wZS5pbWFnZS5zcmMgPSBkYXRhXG4gIFxuIyBNb3VzZSBldmVudHNcbiAgXG50eCA9IGthbGVpZG9zY29wZS5vZmZzZXRYXG50eSA9IGthbGVpZG9zY29wZS5vZmZzZXRZXG50ciA9IGthbGVpZG9zY29wZS5vZmZzZXRSb3RhdGlvblxuICBcbm9uTW91c2VNb3ZlZCA9ICggZXZlbnQgKSA9PlxuXG4gIGN4ID0gd2luZG93LmlubmVyV2lkdGggLyAyXG4gIGN5ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMlxuICAgICAgICAgICAgICAgIFxuICBkeCA9IGV2ZW50LnBhZ2VYIC8gd2luZG93LmlubmVyV2lkdGhcbiAgZHkgPSBldmVudC5wYWdlWSAvIHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgICAgICAgIFxuICBoeCA9IGR4IC0gMC41XG4gIGh5ID0gZHkgLSAwLjVcbiAgICAgICAgICAgICAgICBcbiAgdHggPSBoeCAqIGthbGVpZG9zY29wZS5yYWRpdXMgKiAtMlxuICB0eSA9IGh5ICoga2FsZWlkb3Njb3BlLnJhZGl1cyAqIDJcbiAgdHIgPSBNYXRoLmF0YW4yIGh5LCBoeFxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmVkLCBub1xuICAgICAgICAgICAgICAgIFxuIyBJbml0XG4gIFxub3B0aW9ucyA9XG4gIGludGVyYWN0aXZlOiB5ZXNcbiAgZWFzZTogMC4xXG4gICAgICAgICAgICAgICAgXG5kbyB1cGRhdGUgPSA9PlxuICAgICAgICAgICAgICAgIFxuICBpZiBvcHRpb25zLmludGVyYWN0aXZlXG5cbiAgICBkZWx0YSA9IHRyIC0ga2FsZWlkb3Njb3BlLm9mZnNldFJvdGF0aW9uXG4gICAgdGhldGEgPSBNYXRoLmF0YW4yKCBNYXRoLnNpbiggZGVsdGEgKSwgTWF0aC5jb3MoIGRlbHRhICkgKVxuICAgICAgICAgICAgICAgIFxuICAgIGthbGVpZG9zY29wZS5vZmZzZXRYICs9ICggdHggLSBrYWxlaWRvc2NvcGUub2Zmc2V0WCApICogb3B0aW9ucy5lYXNlXG4gICAga2FsZWlkb3Njb3BlLm9mZnNldFkgKz0gKCB0eSAtIGthbGVpZG9zY29wZS5vZmZzZXRZICkgKiBvcHRpb25zLmVhc2VcbiAgICBrYWxlaWRvc2NvcGUub2Zmc2V0Um90YXRpb24gKz0gKCB0aGV0YSAtIGthbGVpZG9zY29wZS5vZmZzZXRSb3RhdGlvbiApICogb3B0aW9ucy5lYXNlXG4gICAgXG4gICAgZG8ga2FsZWlkb3Njb3BlLmRyYXdcbiAgXG4gIHNldFRpbWVvdXQgdXBkYXRlLCAxMDAwLzYwXG4gICAgXG4jIEluaXQgZ3VpXG5cbmd1aSA9IG5ldyBkYXQuR1VJXG5ndWkuYWRkKCBrYWxlaWRvc2NvcGUsICd6b29tJyApLm1pbiggMC4yNSApLm1heCggMi4wIClcbmd1aS5hZGQoIGthbGVpZG9zY29wZSwgJ3NsaWNlcycgKS5taW4oIDYgKS5tYXgoIDMyICkuc3RlcCggMiApXG5ndWkuYWRkKCBrYWxlaWRvc2NvcGUsICdyYWRpdXMnICkubWluKCAyMDAgKS5tYXgoIDUwMCApXG5ndWkuYWRkKCBrYWxlaWRvc2NvcGUsICdvZmZzZXRYJyApLm1pbiggLWthbGVpZG9zY29wZS5yYWRpdXMgKS5tYXgoIGthbGVpZG9zY29wZS5yYWRpdXMgKS5saXN0ZW4oKVxuZ3VpLmFkZCgga2FsZWlkb3Njb3BlLCAnb2Zmc2V0WScgKS5taW4oIC1rYWxlaWRvc2NvcGUucmFkaXVzICkubWF4KCBrYWxlaWRvc2NvcGUucmFkaXVzICkubGlzdGVuKClcbmd1aS5hZGQoIGthbGVpZG9zY29wZSwgJ29mZnNldFJvdGF0aW9uJyApLm1pbiggLU1hdGguUEkgKS5tYXgoIE1hdGguUEkgKS5saXN0ZW4oKVxuZ3VpLmFkZCgga2FsZWlkb3Njb3BlLCAnb2Zmc2V0U2NhbGUnICkubWluKCAwLjUgKS5tYXgoIDQuMCApXG5ndWkuYWRkKCBvcHRpb25zLCAnaW50ZXJhY3RpdmUnICkubGlzdGVuKClcbmd1aS5jbG9zZSgpXG5cbm9uQ2hhbmdlID0gPT5cblxuICBrYWxlaWRvc2NvcGUuZG9tRWxlbWVudC5zdHlsZS5tYXJnaW5MZWZ0ID0gLWthbGVpZG9zY29wZS5yYWRpdXMgKyAncHgnXG4gIGthbGVpZG9zY29wZS5kb21FbGVtZW50LnN0eWxlLm1hcmdpblRvcCA9IC1rYWxlaWRvc2NvcGUucmFkaXVzICsgJ3B4J1xuICAgIFxuICBvcHRpb25zLmludGVyYWN0aXZlID0gbm9cbiAgICBcbiAgZG8ga2FsZWlkb3Njb3BlLmRyYXdcblxuKCBjLm9uQ2hhbmdlIG9uQ2hhbmdlIHVubGVzcyBjLnByb3BlcnR5IGlzICdpbnRlcmFjdGl2ZScgKSBmb3IgYyBpbiBndWkuX19jb250cm9sbGVycyJdfQ==
//# sourceURL=coffeescript