using System;
using System.Diagnostics;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ITIncidentCopilot.Api.Middleware
{
    public class ApiErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = "INTERNAL_SERVER_ERROR";
        public string TraceId { get; set; } = string.Empty;
    }

    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                string traceId = Activity.Current?.Id ?? context.TraceIdentifier;
                _logger.LogError(ex, "Unhandled exception occurred during request execution. TraceId: {TraceId}", traceId);
                await HandleExceptionAsync(context, ex, traceId);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception, string traceId)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, errorCode, userMessage) = exception switch
            {
                KeyNotFoundException => ((int)HttpStatusCode.NotFound, "INCIDENT_NOT_FOUND", "The requested IT incident record was not found."),
                InvalidOperationException => ((int)HttpStatusCode.BadRequest, "INVALID_STATE_TRANSITION", exception.Message),
                ArgumentException => ((int)HttpStatusCode.BadRequest, "INVALID_ARGUMENT", exception.Message),
                UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "UNAUTHORIZED", "Access is denied due to invalid credentials."),
                _ => ((int)HttpStatusCode.InternalServerError, "INTERNAL_SERVER_ERROR", "An unexpected system error occurred. Please contact IT support.")
            };

            context.Response.StatusCode = statusCode;

            var errorResponse = new ApiErrorResponse
            {
                Success = false,
                Message = userMessage,
                Code = errorCode,
                TraceId = traceId
            };

            string jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            return context.Response.WriteAsync(jsonResponse);
        }
    }
}
