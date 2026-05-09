import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

const ZOEDEPTH_MODEL =
  "zedge/zoedepth:fd85428545f04150f59856dab2a51a7be2ca5003a331920b0e4303b17b411332";

import { withCharge } from "@/app/lib/server/with-charge";

export const POST = withCharge("image-labelifier-depth", async (request: NextRequest) => {
  const token = process.env.REPLICATE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_TOKEN not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const replicate = new Replicate({ auth: token });

  const output = await replicate.run(ZOEDEPTH_MODEL, {
    input: { image: imageFile },
  });

  // output is a FileOutput — get the URL
  const depthUrl =
    output && typeof output === "object" && "url" in output
      ? (output as { url: () => string }).url()
      : String(output);

  return NextResponse.json({ depthUrl });
});
