import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  // private supabase: SupabaseClient;

  constructor() {
    // const supabaseUrl = process.env.SUPABASE_URL;
    // const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // if (!supabaseUrl || !supabaseKey) {
    //   throw new Error('Supabase URL and Key must be provided');
    // }

    // this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadAvatar(userId: string, file: any): Promise<string> {
    // TODO: Implementar cuando Supabase esté configurado
    throw new HttpException(
      {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Avatar upload not implemented yet',
      },
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async deleteAvatar(avatarUrl: string): Promise<void> {
    // TODO: Implementar cuando Supabase esté configurado
    console.log('Avatar deletion not implemented yet');
  }

  async uploadProductImage(productId: string, file: any): Promise<string> {
    // TODO: Implementar cuando Supabase esté configurado
    throw new HttpException(
      {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Product image upload not implemented yet',
      },
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async deleteProductImage(imageUrl: string): Promise<void> {
    // TODO: Implementar cuando Supabase esté configurado
    console.log('Product image deletion not implemented yet');
  }
}
