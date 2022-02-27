global using System;
global using System.Threading.Tasks;
global using System.Collections.Generic;

global using TestBaza.Models;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TestBaza.Data;

var builder = WebApplication.CreateBuilder(args);

IServiceCollection services = builder.Services;
{
    string connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
    services.AddDatabaseDeveloperPageExceptionFilter();

    services.AddDefaultIdentity<User>(options => {
        //��������� ����� ����� ���� ���������� ��������������� ����� ModelState.IsValid � �������� ��������� � ������
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequiredLength = 0;
        options.Password.RequiredUniqueChars = 0;
        options.User.AllowedUserNameCharacters += "�������������������������������������Ũ���������������������������";
        options.SignIn.RequireConfirmedAccount = false;
    })
        .AddEntityFrameworkStores<AppDbContext>();

    services.AddControllersWithViews();
}
WebApplication app = builder.Build();

{
    if (app.Environment.IsDevelopment()) app.UseMigrationsEndPoint();
    else app.UseHsts();
    

    app.UseHttpsRedirection();
    app.UseStaticFiles();

    app.UseRouting();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");
}
app.Run();
