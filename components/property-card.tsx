import Link from "next/link"
import Image from "next/image"
import { MapPin, Bed, Bath, Maximize } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Imovel, formatarPreco } from "@/lib/data"

interface PropertyCardProps {
  imovel: Imovel
}

export function PropertyCard({ imovel }: PropertyCardProps) {
  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imovel.imagem}
          alt={imovel.titulo}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${
            imovel.tipo === "venda" 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            {imovel.tipo === "venda" ? "Venda" : "Aluguel"}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {imovel.titulo}
        </h3>
        
        <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{imovel.cidade}</span>
        </div>

        {(imovel.quartos || imovel.banheiros || imovel.area) && (
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            {imovel.quartos !== undefined && imovel.quartos > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{imovel.quartos}</span>
              </div>
            )}
            {imovel.banheiros !== undefined && imovel.banheiros > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{imovel.banheiros}</span>
              </div>
            )}
            {imovel.area !== undefined && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{imovel.area}m²</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">
            {formatarPreco(imovel.preco, imovel.tipo)}
          </p>
          <Link href={`/imoveis/${imovel.id}`}>
            <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
