//Перемещение mover стены
DragControls2 = function ( _objects, _camera, _domElement, _plane_normal ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _plane = new THREE.Plane();
  _plane.normal = _plane_normal || new THREE.Vector3( 0, 1, 0 );
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function dispose() {

		deactivate();

	}

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//        _selected.position.copy(_intersection.clone().sub( _offset )) ;
        _selected.position.copy( _selected.parent.worldToLocal(_intersection.clone().sub( _offset )) )  ;

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

//      _offset.copy( _intersection.clone() .sub( _selected.position ) );   //=============
      if(_selected.parent)
      _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

    intersects = [];

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//				_offset.copy( _intersection ).sub( _selected.position.clone() );
        if(_selected.parent)
        _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		if ( _selected ) {

      scope.dispatchEvent( { type: 'dragend', object: _selected } );
        _selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls2: setObjects() has been removed.' );

	};


};
DragControls2.prototype = Object.create( THREE.EventDispatcher.prototype );
DragControls2.prototype.constructor = DragControls2;
//Перемещение
DragControls = function ( _objects, _camera, _domElement, _plane_normal ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _plane = new THREE.Plane();
  _plane.normal = _plane_normal || new THREE.Vector3( 0, 1, 0 );
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;
  var _click = 0;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function dispose() {

		deactivate();

	}

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//        _selected.position.copy(_intersection.clone().sub( _offset )) ;
        if(_selected.parent)
        _selected.position.copy( _selected.parent.worldToLocal(_intersection.clone().sub( _offset )) )  ;

			}

      //проверка, что не просто клик
//      _click += 1;
//      if( event.which == 1 && _click > 1 ){
        scope.dispatchEvent( { type: 'drag', object: _selected } );
//      }



//      _offset.copy( _intersection.clone() .sub( _selected.position ) );   //=============
//      _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

    intersects = [];

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//				_offset.copy( _intersection ).sub( _selected.position.clone() );
        if(_selected.parent)
        _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();


		if ( _selected ) {

      scope.dispatchEvent( { type: 'dragend', object: _selected } );
        _selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

};
DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
DragControls.prototype.constructor = DragControls;
//выбор элемента
SelectControls = function ( _objects, _camera, _domElement ){

  if ( _objects instanceof THREE.Camera ) {

		console.warn( 'SelectControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}


  var _plane = new THREE.Plane();
  _plane.normal = new THREE.Vector3( 0, 1, 0 );
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _selected = null, _hovered = null;
  var _coord = null;

	//

	var scope = this;

  function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    _domElement.addEventListener( 'contextmenu', onDocumentContextMenu, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    _domElement.removeEventListener( 'contextmenu', onDocumentContextMenu, false );

	}

  function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );


		_raycaster.setFromCamera( _mouse, _camera );

    intersects = [];

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

        if ( _hovered !== null ){
          scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );
          _hovered = null;
        }


				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

    function onDocumentMouseDown( event ) {

        event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
        _mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects );

        if ( intersects.length > 0 ) {

      _selected = intersects[ 0 ].object;

    //			_domElement.style.cursor = 'move';
      _coord = {x:event.clientX, y:event.clientY};
            scope.dispatchEvent( { type: 'select', object: _selected, screenCoord: _coord } );

        } else {
      scope.dispatchEvent( { type: 'unselect', object: _selected, screenCoord: _coord } );
    }


    }

    function onDocumentMouseUp( event ) {

        event.preventDefault();

        if ( _selected ) {

      scope.dispatchEvent( { type: 'end', object: _selected } );
        _selected = null;

        }

        _domElement.style.cursor = 'auto';

    }

  function onDocumentContextMenu( event ){
   		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

      _coord = {x:event.clientX, y:event.clientY};
			scope.dispatchEvent( { type: 'select_contextmenu', object: _selected, screenCoord: _coord } );

		} else {
      scope.dispatchEvent( { type: 'unselect', object: _selected, screenCoord: _coord } );
    }
  }

  activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;


};
SelectControls.prototype = Object.create( THREE.EventDispatcher.prototype );
SelectControls.prototype.constructor = SelectControls;



