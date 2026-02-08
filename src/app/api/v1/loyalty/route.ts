import { loyaltyProgramService } from "@/lib/services/loyalty/loyalty-program.service";
import { auth } from "@/lib/auth/auth";
import { validateBody } from "@/lib/middleware/validation-helper";
import { loyaltyRedeemSchema, type LoyaltyRedeemInput } from "@/validations/api.schema";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/middleware/app-error";
import { ApiResponseHandler } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED", true);
    }

    const account = await loyaltyProgramService.getAccount(session.user.id);

    if (!account) {
      throw new AppError(404, "Loyalty account not found", "ACCOUNT_NOT_FOUND", true);
    }

    const benefits = loyaltyProgramService.getTierBenefits(account.tier);
    const allTiers = loyaltyProgramService.getAllTiers();

    return NextResponse.json(
      ApiResponseHandler.success({
        account,
        benefits,
        allTiers,
      })
    );
  } catch (error) {
    console.error("Loyalty account error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(ApiResponseHandler.error("LOYALTY_ERROR", "Internal server error"), {
      status: 500,
    });
  }
}

export const POST = validateBody<LoyaltyRedeemInput>(loyaltyRedeemSchema)(async (
  req: NextRequest,
  validated: LoyaltyRedeemInput
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED", true);
    }

    const { action, points } = validated;

    if (action === "redeem") {
      const result = await loyaltyProgramService.redeemPoints(session.user.id, points);
      return NextResponse.json(ApiResponseHandler.success(result));
    }

    throw new AppError(400, "Invalid action", "INVALID_ACTION", true);
  } catch (error) {
    console.error("Loyalty action error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(ApiResponseHandler.error(error.code, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(ApiResponseHandler.error("LOYALTY_ERROR", "Internal server error"), {
      status: 500,
    });
  }
});
