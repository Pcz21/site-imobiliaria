using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiImobiliaria.Migrations
{
    /// <inheritdoc />
    public partial class CriarTabelaImoveis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Imoveis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Cidade = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Preco = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Imagem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quartos = table.Column<int>(type: "int", nullable: false),
                    Banheiros = table.Column<int>(type: "int", nullable: false),
                    Area = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Vagas = table.Column<int>(type: "int", nullable: false),
                    Destaque = table.Column<bool>(type: "bit", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    Visualizacoes = table.Column<int>(type: "int", nullable: false),
                    CorretorEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Whatsapp = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Imagens = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Videos = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Imoveis", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Imoveis_Ativo",
                table: "Imoveis",
                column: "Ativo");

            migrationBuilder.CreateIndex(
                name: "IX_Imoveis_Cidade",
                table: "Imoveis",
                column: "Cidade");

            migrationBuilder.CreateIndex(
                name: "IX_Imoveis_CorretorEmail",
                table: "Imoveis",
                column: "CorretorEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Imoveis_CriadoEm",
                table: "Imoveis",
                column: "CriadoEm");

            migrationBuilder.CreateIndex(
                name: "IX_Imoveis_Tipo",
                table: "Imoveis",
                column: "Tipo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Imoveis");
        }
    }
}
