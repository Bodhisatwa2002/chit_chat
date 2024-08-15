"use server";

import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function checkAuthStatus() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return { success: false };
  //namespaces are important in redis
  const userId = `user:${user.id}`;
  //it will get the names , age, and all the fields user has stored
  const existingUser = await redis.hgetall(userId);
  //it will check if the user is there in our database or not . if it is not there we will sign it up
  if (!existingUser || Object.keys(existingUser).length === 0) {
    const imgIsNull = user.picture?.includes("gravatar");
    const image = imgIsNull ? "" : user.picture;

    await redis.hset(userId, {
      id: user.id,
      email: user.email,
      name: `${user.given_name} ${user.family_name}`,
      image: image,
    });
  }
  return { success: true };
}
