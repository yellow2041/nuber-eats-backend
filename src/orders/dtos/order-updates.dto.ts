import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../endities/order.entity';

@InputType()
export class OrderUpdatesInput extends PickType(Order, ['id']) {}
