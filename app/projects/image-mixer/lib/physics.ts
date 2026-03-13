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
  const bowlHeight = 200;
  const bowlX = width / 2;
  const bowlY = height * 0.45;

  // Build bowl as a U-shape: left wall, right wall, bottom curve segments
  const walls: Matter.Body[] = [];
  const segments = 16;
  const halfW = bowlWidth / 2;

  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI + (Math.PI * i) / segments; // bottom half of circle
    const cx = bowlX + halfW * Math.cos(angle);
    const cy = bowlY + bowlHeight * 0.5 + (bowlHeight * 0.5) * Math.sin(angle);
    const seg = Bodies.circle(cx, cy, BOWL_WALL_THICKNESS / 2, {
      isStatic: true,
      render: { visible: false },
      friction: 0.3,
      restitution: 0.2,
    });
    walls.push(seg);
  }

  // Fill gaps between circle segments with rectangles
  for (let i = 0; i < segments; i++) {
    const a1 = Math.PI + (Math.PI * i) / segments;
    const a2 = Math.PI + (Math.PI * (i + 1)) / segments;
    const x1 = bowlX + halfW * Math.cos(a1);
    const y1 = bowlY + bowlHeight * 0.5 + (bowlHeight * 0.5) * Math.sin(a1);
    const x2 = bowlX + halfW * Math.cos(a2);
    const y2 = bowlY + bowlHeight * 0.5 + (bowlHeight * 0.5) * Math.sin(a2);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const rect = Bodies.rectangle(mx, my, len + 4, BOWL_WALL_THICKNESS, {
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
    bowlHeight,
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
  const y = scene.bowlY - scene.bowlHeight - 40;

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
