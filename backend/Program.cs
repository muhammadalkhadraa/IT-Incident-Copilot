using System.Text;
using ITIncidentCopilot.Api.Application.Diagnostics;
using ITIncidentCopilot.Api.Application.Services;
using ITIncidentCopilot.Api.Data;
using ITIncidentCopilot.Api.Hubs;
using ITIncidentCopilot.Api.Middleware;
using ITIncidentCopilot.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add Services to DI container
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

// Configure PostgreSQL with EF Core pgvector extension
var connString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=it_copilot;Username=postgres;Password=copilot_secure_pass_2026";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connString, o => o.UseVector()));

// Register Extensible Diagnostic Test Plugins in DI
builder.Services.AddScoped<IDiagnosticTest, PingGatewayTest>();
builder.Services.AddScoped<IDiagnosticTest, PingInternetTest>();
builder.Services.AddScoped<IDiagnosticTest, DnsResolutionTest>();
builder.Services.AddScoped<IDiagnosticTest, IpConfigurationTest>();
builder.Services.AddScoped<IDiagnosticTest, CpuUsageTest>();
builder.Services.AddScoped<IDiagnosticTest, MemoryUsageTest>();

// Register Application & Domain Services in DI
builder.Services.AddScoped<IDiagnosticEngineService, DiagnosticEngineService>();
builder.Services.AddScoped<IPriorityCalculationEngine, PriorityCalculationEngine>();
builder.Services.AddScoped<IIncidentStateMachine, IncidentStateMachine>();
builder.Services.AddScoped<IIncidentService, IncidentService>();
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// Configure JWT Authentication & Authorization Policies
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "SuperSecretKey_IT_Incident_Copilot_Enterprise_Jwt_2026!#";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ITIncidentCopilotApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ITIncidentCopilotClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("ADMINISTRATOR"));
    options.AddPolicy("RequireManager", policy => policy.RequireRole("IT_MANAGER", "ADMINISTRATOR"));
    options.AddPolicy("RequireTech", policy => policy.RequireRole("TECHNICIAN", "IT_MANAGER", "ADMINISTRATOR"));
});

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p =>
        p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true));
});

var app = builder.Build();

// Centralized Global Exception Handling Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<IncidentHub>("/hubs/incidents");

app.Run();
