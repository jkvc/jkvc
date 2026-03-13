import Matter from "matter-js";

const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Events, Runner } =
  Matter;

export interface BallData {
  id: string;
  body: Matter.Body;
  imageUrl: string;
  radius: number;
  baseRadius: number;
  selected: boolean;
}

export interface BowlScene {
  engine: Matter.Engine;
  runner: Matter.Runner;
  mouseConstraint: Matter.MouseConstraint;
  balls: BallData[];
  bowlWalls: Matter.Body[];
  bowlWidth: number;
  bowlHeight: number;
  bowlY: number;
  canvasWidth: number;
  canvasHeight: number;
}

const BALL_BASE_RADIUS = 38;
const BALL_SELECTED_RADIUS = 58;
const BALL_SHRUNK_RADIUS = 30;
const BOWL_WALL_THICKNESS = 20;

export function createBowlScene(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): BowlScene {
  const engine = Engine.create({
    gravity: { x: 0, y: 1.2, scale: 0.001 },
  });

  const bowlWidth = Math.min(width - 40, 400);
  const bowlDepth = 160;
  const bowlX = width / 2;
  const bowlY = height * 0.35; // rim y position

  // Build bowl as a U-shape using a bezier-sampled curve
  // This must match the visual bezier in BowlCanvas drawBowl()
  const walls: Matter.Body[] = [];
  const segments = 24;
  const halfW = bowlWidth / 2;

  // Sample points along the same bezier used for drawing
  const bezierPoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Cubic bezier: P0=(left rim), P1=(left bottom), P2=(right bottom), P3=(right rim)
    const p0x = bowlX - halfW, p0y = bowlY;
    const p1x = bowlX - halfW, p1y = bowlY + bowlDepth * 1.8;
    const p2x = bowlX + halfW, p2y = bowlY + bowlDepth * 1.8;
    const p3x = bowlX + halfW, p3y = bowlY;

    const mt = 1 - t;
    const x = mt*mt*mt*p0x + 3*mt*mt*t*p1x + 3*mt*t*t*p2x + t*t*t*p3x;
    const y = mt*mt*mt*p0y + 3*mt*mt*t*p1y + 3*mt*t*t*p2y + t*t*t*p3y;
    bezierPoints.push({ x, y });
  }

  // Create rectangle segments along the bezier
  for (let i = 0; i < bezierPoints.length - 1; i++) {
    const p1 = bezierPoints[i];
    const p2 = bezierPoints[i + 1];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const rect = Bodies.rectangle(mx, my, len + 2, BOWL_WALL_THICKNESS, {
      isStatic: true,
      angle: ang,
      render: { visible: false },
      friction: 0.3,
      restitution: 0.2,
    });
    walls.push(rect);
  }

  World.add(engine.world, walls);

  // Mouse interaction
  const mouse = Mouse.create(canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });

  // Fix for HiDPI: mouse needs pixel ratio
  mouse.pixelRatio = window.devicePixelRatio || 1;

  World.add(engine.world, mouseConstraint);

  const runner = Runner.create();
  Runner.run(runner, engine);

  return {
    engine,
    runner,
    mouseConstraint,
    balls: [],
    bowlWalls: walls,
    bowlWidth,
    bowlHeight: bowlDepth,
    bowlY,
    canvasWidth: width,
    canvasHeight: height,
  };
}

export function addBall(
  scene: BowlScene,
  imageUrl: string,
  id: string
): BallData {
  const radius = BALL_BASE_RADIUS;
  // Drop from above the bowl, random x within bowl
  const spread = scene.bowlWidth * 0.3;
  const x =
    scene.canvasWidth / 2 + (Math.random() - 0.5) * spread;
  const y = scene.bowlY - 60;

  const body = Bodies.circle(x, y, radius, {
    restitution: 0.4,
    friction: 0.3,
    density: 0.002,
    frictionAir: 0.01,
  });

  World.add(scene.engine.world, body);

  const ball: BallData = {
    id,
    body,
    imageUrl,
    radius,
    baseRadius: BALL_BASE_RADIUS,
    selected: false,
  };

  scene.balls.push(ball);
  return ball;
}

export function selectBall(scene: BowlScene, ballId: string | null) {
  for (const ball of scene.balls) {
    if (ball.id === ballId) {
      ball.selected = true;
      ball.radius = BALL_SELECTED_RADIUS;
      const scale = BALL_SELECTED_RADIUS / ball.baseRadius;
      Body.scale(ball.body, scale / (ball.body.circleRadius! / ball.baseRadius), scale / (ball.body.circleRadius! / ball.baseRadius));
    } else if (ball.selected) {
      ball.selected = false;
      ball.radius = scene.balls.length > 2 ? BALL_SHRUNK_RADIUS : BALL_BASE_RADIUS;
      const currentScale = ball.body.circleRadius! / ball.baseRadius;
      const targetScale = ball.radius / ball.baseRadius;
      Body.scale(ball.body, targetScale / currentScale, targetScale / currentScale);
    } else {
      ball.radius = ballId ? BALL_SHRUNK_RADIUS : BALL_BASE_RADIUS;
      const currentScale = ball.body.circleRadius! / ball.baseRadius;
      const targetScale = ball.radius / ball.baseRadius;
      if (Math.abs(currentScale - targetScale) > 0.01) {
        Body.scale(ball.body, targetScale / currentScale, targetScale / currentScale);
      }
    }
  }
}

export function removeBall(scene: BowlScene, ballId: string) {
  const idx = scene.balls.findIndex((b) => b.id === ballId);
  if (idx === -1) return;
  const ball = scene.balls[idx];
  World.remove(scene.engine.world, ball.body);
  scene.balls.splice(idx, 1);

  // Reset remaining ball sizes
  for (const b of scene.balls) {
    b.selected = false;
    b.radius = b.baseRadius;
    const currentScale = b.body.circleRadius! / b.baseRadius;
    if (Math.abs(currentScale - 1) > 0.01) {
      Body.scale(b.body, 1 / currentScale, 1 / currentScale);
    }
  }
}

export function destroyScene(scene: BowlScene) {
  Runner.stop(scene.runner);
  World.clear(scene.engine.world, false);
  Engine.clear(scene.engine);
}

export function isBallOutOfBowl(scene: BowlScene, ball: BallData): boolean {
  const pos = ball.body.position;
  // Out if below canvas or far left/right
  return (
    pos.y > scene.canvasHeight + 50 ||
    pos.x < -50 ||
    pos.x > scene.canvasWidth + 50
  );
}

export {
  BALL_BASE_RADIUS,
  BALL_SELECTED_RADIUS,
  BALL_SHRUNK_RADIUS,
};
