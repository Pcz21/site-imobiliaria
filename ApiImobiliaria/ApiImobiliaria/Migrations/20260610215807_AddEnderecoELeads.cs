using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiImobiliaria.Migrations
{
    /// <inheritdoc />
    public partial class AddEnderecoELeads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Endereco",
                table: "Imoveis",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Leads",
                table: "Imoveis",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Endereco",
                table: "Imoveis");

            migrationBuilder.DropColumn(
                name: "Leads",
                table: "Imoveis");
        }
    }
}
