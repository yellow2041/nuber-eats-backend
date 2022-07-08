import { Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantsResolver {
  @Query(() => Boolean)
  isPizzaGood(): boolean {
    return true;
  }
}
