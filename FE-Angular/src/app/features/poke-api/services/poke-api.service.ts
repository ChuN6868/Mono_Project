import { inject, Injectable } from "@angular/core";
import { ApiService } from "../../../core/services/api.service";
import { PokemonListRequestModel } from "../models/pokemon-list-request.model";
import { Observable } from "rxjs";
import { PokemonListResponseModel } from "../models/pokemon-list-response.model";
import { HttpResponse } from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class PokeApiService {
    /** API通信サービス */
    private readonly apiService = inject(ApiService);

    /** URL */
    private readonly API_URL = 'https://pokeapi.co/api/v2';

    /**
     * ポケモン取得
     */
    getPokemonList(params: PokemonListRequestModel): Observable<HttpResponse<PokemonListResponseModel>> {
        return this.apiService.get<HttpResponse<PokemonListResponseModel>>(`${this.API_URL}/pokemon`, params);
    }
}