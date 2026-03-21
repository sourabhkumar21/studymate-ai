import { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node";

export const clerkWebhooks = async (req: Request, res: Response): Promise<any> => {
  try {
    // This official Clerk function handles the raw body parsing and Svix verification for us!
    const evt: any = await verifyWebhook(req);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        await prisma.user.create({
          data: {
            id: data.id,
            email: data?.email_addresses[0]?.email_address,
            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "Student",
            image: data?.image_url || "none",
          },
        });
        console.log(`✅ Webhook: User ${data.id} created!`);
        break;
      }

      case "user.updated": {
        await prisma.user.update({
          where: { id: data.id },
          data: {
            email: data?.email_addresses[0]?.email_address,
            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "Student",
            image: data?.image_url || "none",
          }
        });
        console.log(`🔄 Webhook: User ${data.id} updated!`);
        break;
      }

      case "user.deleted": {
        await prisma.user.delete({ where: { id: data.id } });
        console.log(`🗑️ Webhook: User ${data.id} deleted!`);
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ message: "Webhook Received: " + type });

  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Webhook Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};