import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dto/create-payment.dto';
import { GetPaymentsOutput } from './dto/get-payments.dto';
import { Payment } from './entities/payment.entity';
import { Cron, Interval, Timeout, SchedulerRegistry } from '@nestjs/schedule';

Injectable();
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowed to do this.',
        };
      }
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUtil = date;
      this.restaurants.save(restaurant);
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create payment.',
      };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ relations: { user: true } });
      return {
        ok: true,
        payments,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not load payment',
      };
    }
  }
  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      where: { isPromoted: true, promotedUtil: LessThan(new Date()) },
    });
    restaurants.forEach(async restaurant => {
      restaurant.isPromoted = false;
      restaurant.promotedUtil = null;
      await this.restaurants.save(restaurant);
    });
  }
}
