import { createChargeSystem, type ChargeRedis } from "next-charge";
import { getRedis } from "./redis";
import { CHARGE_POOLS } from "../charge-pools";

function adaptIoredis(): ChargeRedis {
  const raw = getRedis();
  return {
    get: (k) => raw.get(k),
    set: (k, v) => raw.set(k, v) as Promise<unknown>,
    eval: (script, keys, args) =>
      raw.eval(script, keys.length, ...keys, ...args),
  };
}

const charge = createChargeSystem({
  redis: adaptIoredis(),
  pools: CHARGE_POOLS,
  devBypass: process.env.NODE_ENV === "development",
});

export const {
  withCharge,
  consumeCharge,
  getChargeState,
  getAllChargeStates,
  topOff,
  checkCharges,
  chargeStatusHandler,
  checkHandler,
} = charge;
