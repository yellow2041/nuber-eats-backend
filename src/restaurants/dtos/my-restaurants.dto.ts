import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
@ObjectType()
export class MyRestaurantsOutput extends CoreOutput {
  @Field(type => [Restaurant])
  restaurants?: Restaurant[];
}
