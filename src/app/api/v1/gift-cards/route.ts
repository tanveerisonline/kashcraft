import { giftCardVoucherService } from "@/lib/services/ecommerce/gift-card-voucher.service";
import { auth } from "@/lib/auth/auth";
import { validateBody } from "@/lib/middleware/validation-helper";
import {
  giftCardValidateSchema,
  giftCardRedeemSchema,
  type GiftCardValidateInput,
  type GiftCardRedeemInput,
} from "@/validations/api.schema";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/middleware/app-error";
import { ApiResponseHandler } from "@/lib/api/response";

export const POST = validateBody<GiftCardValidateInput | GiftCardRedeemInput>(
  giftCardValidateSchema.or(giftCardRedeemSchema)
)(async (req: NextRequest, validated: GiftCardValidateInput | GiftCardRedeemInput) => {
  try {
    const validatedAny = validated as any;
    const { code, action } = validatedAny;

    if (action === "validate") {
      const giftCard = await giftCardVoucherService.getGiftCard(code);
      const valid = await giftCardVoucherService.validateGiftCard(code);

      return NextResponse.json(
        ApiResponseHandler.success({
          valid,
          currentBalance: giftCard?.currentBalance,
          code: code.slice(-4),
        })
      );
    }

    if (action === "redeem") {
      const session = await auth();

      if (!session?.user?.id) {
        throw new AppError(401, "Unauthorized", "UNAUTHORIZED", true);
      }

      const { orderId, amount } = validated as GiftCardRedeemInput;
      const result = await giftCardVoucherService.redeemGiftCard(
        code,
        orderId,
        session.user.id,
        amount
      );

      return NextResponse.json(ApiResponseHandler.success(result));
    }

    throw new AppError(400, "Invalid action", "INVALID_ACTION", true);
  } catch (error) {
    console.error("Gift card error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(ApiResponseHandler.error("GIFT_CARD_ERROR", "Invalid gift card"), {
      status: 400,
    });
  }
});
