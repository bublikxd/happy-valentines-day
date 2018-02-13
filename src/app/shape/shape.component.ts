import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-shape',
  templateUrl: './shape.component.html',
  styleUrls: ['./shape.component.css']
})
export class ShapeComponent implements AfterViewInit {

  /* HEART PROPERTIES */
  @Input() public rotationSpeedX: number = 0.005;
  @Input() public rotationSpeedY: number = 0.01;
  @Input() public size: number = 200;

  /* STAGE PROPERTIES */
  @Input() public fieldOfView: number = 50;
  @Input() public nearClippingPane: number = 1;
  @Input() public farClippingPane: number = 1000;

  @ViewChild('canvas') private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private extrudeSettings = {
    amount: 8,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1
  };

  private camera: THREE.PerspectiveCamera;
  private heart: THREE.Shape;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  private isUserInteracting: boolean = false;
  private latitude: number = 0;
  private longitude: number = 0;
  private onPointerDownPointerX: number = 0;
  private onPointerDownPointerY: number = 0;
  private onPointerDownLongitude: number = 0;
  private onPointerDownLatitude: number = 0;
  private phi: number = 0;
  private theta: number = 0;

  constructor() { }

  private animateHeart() { }

  private createHeart() {
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo( x + 5, y + 5 );
    heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
    heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );
    this.heart = heartShape;

    const geometry = new THREE.ExtrudeGeometry(this.heart, this.extrudeSettings);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(Math.PI * 3, Math.PI * 3, Math.PI * 3);

    this.scene.add(mesh);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    const aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.set(50, 75, 500);

    this.scene.add(this.camera);
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    const component: ShapeComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateHeart();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  public onMouseDown(event: MouseEvent) {
    event.preventDefault();

    this.isUserInteracting = true;
    this.onPointerDownPointerX = event.clientX;
    this.onPointerDownPointerY = event.clientY;
    this.onPointerDownLatitude = this.latitude;
    this.onPointerDownLongitude = this.longitude;
  }

  public onMouseMove(event: MouseEvent) {
    if (this.isUserInteracting !== true) {
      // Propagate event
      return true;
    }

    this.latitude = (event.clientY - this.onPointerDownPointerY) * 0.1 +
      this.onPointerDownLatitude;
    this.longitude = (this.onPointerDownPointerX - event.clientX) * 0.1 +
      this.onPointerDownLongitude;
  }

  public onMouseUp(event: MouseEvent) {
    this.isUserInteracting = false;
  }

  onResize() {
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  ngAfterViewInit() {
    this.createScene();
    this.createHeart();
    this.startRenderingLoop();
  }

}
